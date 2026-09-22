/**
 * The rich text editor (CC-23).
 *
 * Produces HTML. The server sanitises it on write — this editor is a
 * convenience, not a security boundary, and nothing here should be mistaken
 * for one: the API accepts whatever a client sends.
 *
 * See campus_cure_backend/docs/specs/CC-23-rich-text.md.
 */

import { useCallback } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Tooltip } from "antd";
import {
  Bold,
  Code,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Sigma,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: number;
}

/** One toolbar button. Kept local — nothing else needs this shape. */
const ToolButton = ({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <Tooltip title={label}>
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      // Buttons inside a form would submit it; this is a formatting control.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
        active
          ? "bg-blue-100 text-primary dark:bg-blue-900/40 dark:text-blue-300"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  </Tooltip>
);

export const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Write your question…",
  disabled = false,
  minHeight = 160,
}: Props) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Images are CC-02's, and CC-02 is dormant. Leaving the extension in
        // would give students a paste-an-image affordance that silently fails.
        heading: { levels: [3, 4] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        // Mirrors the server's allow-list so the editor cannot create a link
        // the sanitiser will then strip.
        protocols: ["http", "https", "mailto"],
        HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor: instance }) => onChange(instance.getHTML()),
    editorProps: {
      attributes: {
        class: "cc23-prose focus:outline-none",
        "data-placeholder": placeholder,
      },
    },
  });

  /**
   * Math is a span the server's allow-list already permits, inserted as raw
   * HTML rather than as a TipTap node: a full math extension is a dependency
   * and a schema for a feature that is one span.
   */
  const insertMath = useCallback(() => {
    if (!editor) return;

    const latex = window.prompt("LaTeX (without $ delimiters)", "\\frac{a}{b}");
    if (!latex) return;

    editor
      .chain()
      .focus()
      .insertContent(
        `<span class="math-inline">${latex
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</span>&nbsp;`,
      )
      .run();
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        "rounded-lg border bg-background",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5">
        <ToolButton
          label="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Heading"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 className="h-4 w-4" />
        </ToolButton>

        <span className="mx-1 h-5 w-px bg-border" />

        <ToolButton
          label="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Quote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </ToolButton>

        <span className="mx-1 h-5 w-px bg-border" />

        <ToolButton
          label="Code block"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Link"
          active={editor.isActive("link")}
          onClick={setLink}
        >
          <LinkIcon className="h-4 w-4" />
        </ToolButton>
        <ToolButton label="Math (LaTeX)" onClick={insertMath}>
          <Sigma className="h-4 w-4" />
        </ToolButton>
      </div>

      <EditorContent
        editor={editor}
        style={{ minHeight }}
        className="px-3 py-2 text-sm [&_.ProseMirror]:min-h-[inherit] [&_.ProseMirror]:outline-none"
      />
    </div>
  );
};

/** What the API expects alongside the body. */
export const RICH_TEXT_FORMAT = "HTML" as const;

export default RichTextEditor;
