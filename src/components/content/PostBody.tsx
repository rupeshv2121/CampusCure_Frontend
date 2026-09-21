/**
 * Render a doubt or answer body, highlighting fenced code (CC-22).
 *
 * Read path only. Nothing here touches how a post is written — students type
 * triple backticks by hand until CC-23 gives them an editor.
 *
 * See campus_cure_backend/docs/specs/CC-22-code-highlighting.md.
 */

import { useEffect, useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { resolveLanguage, splitCodeBlocks } from "@/lib/codeBlocks";
import { highlightCode } from "@/lib/highlighter";

const CodeBlock = ({
  code,
  lang,
}: {
  code: string;
  lang: string | null;
}) => {
  const resolved = useMemo(() => resolveLanguage(lang), [lang]);
  const [html, setHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // An unsupported or absent language tag renders as plain monospace. That
    // is a deliberate non-guess: highlighting C as Python is worse than not
    // highlighting at all.
    if (!resolved) return;

    let cancelled = false;

    highlightCode(code, resolved)
      .then((result) => {
        if (!cancelled) setHtml(result);
      })
      .catch(() => {
        // Fall back to the plain <pre> already on screen.
        if (!cancelled) setHtml(null);
      });

    return () => {
      cancelled = true;
    };
  }, [code, resolved]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  return (
    <div className="group relative my-3 overflow-hidden rounded-lg border bg-muted/40">
      <div className="flex items-center justify-between border-b px-3 py-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          {resolved ?? lang ?? "code"}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy code"
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {copied ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {html ? (
        /*
         * Shiki's output, not the user's. The markup is generated from a
         * TextMate grammar and the post's text appears inside it only as
         * escaped token content, which is what makes this safe here and
         * nowhere else in this file.
         */
        <div
          className="cc22-shiki overflow-x-auto p-3 text-sm"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        // Rendered immediately, and while the highlighter loads, so a code
        // block never pops in late or blocks first paint.
        <pre className="overflow-x-auto p-3 text-sm">
          <code className="font-mono">{code}</code>
        </pre>
      )}
    </div>
  );
};

export const PostBody = ({
  content,
  className,
}: {
  content: string;
  className?: string;
}) => {
  const segments = useMemo(() => splitCodeBlocks(content), [content]);

  return (
    <div className={cn("space-y-1", className)}>
      {segments.map((segment, index) =>
        segment.kind === "code" ? (
          <CodeBlock
            key={index}
            code={segment.content}
            lang={segment.lang}
          />
        ) : (
          // Unchanged from how every post rendered before CC-22: React
          // children, never innerHTML, so prose cannot inject markup.
          <p
            key={index}
            className="text-foreground whitespace-pre-wrap wrap-break-word"
          >
            {segment.content}
          </p>
        ),
      )}
    </div>
  );
};

export default PostBody;
