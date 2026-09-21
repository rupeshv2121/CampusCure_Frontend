/**
 * Split a plain-text post into prose and fenced code blocks (CC-22).
 *
 * This is deliberately NOT a markdown parser. It understands exactly one
 * construct — the triple-backtick fence — and treats everything else as
 * literal text. Full markdown on user-submitted content is a sanitization
 * problem, and taking it on turns a rendering tweak into a security review.
 * That is CC-23's job, with a real sanitizer.
 *
 * See campus_cure_backend/docs/specs/CC-22-code-highlighting.md.
 */

export type Segment =
  | { kind: "text"; content: string }
  | { kind: "code"; lang: string | null; content: string };

/**
 * Languages we ship grammars for. Anything else renders as plain monospace
 * rather than failing — a student writing Verilog should still get a code
 * block, just an unhighlighted one.
 */
export const SUPPORTED_LANGUAGES = [
  "c",
  "cpp",
  "java",
  "python",
  "javascript",
  "typescript",
  "sql",
  "json",
  "bash",
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** Common spellings students actually type, mapped to a shipped grammar. */
const LANGUAGE_ALIASES: Record<string, SupportedLanguage> = {
  "c++": "cpp",
  cc: "cpp",
  cxx: "cpp",
  py: "python",
  python3: "python",
  js: "javascript",
  jsx: "javascript",
  node: "javascript",
  ts: "typescript",
  tsx: "typescript",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  mysql: "sql",
  postgres: "sql",
  postgresql: "sql",
};

/**
 * Resolve a fence's language tag to a grammar we can load, or null.
 *
 * Null means "render as a code block, but do not highlight" — never an error,
 * and never a guess. Guessing a language wrong is worse than not guessing.
 */
export const resolveLanguage = (raw: string | null): SupportedLanguage | null => {
  if (!raw) return null;

  const key = raw.trim().toLowerCase();
  if ((SUPPORTED_LANGUAGES as readonly string[]).includes(key)) {
    return key as SupportedLanguage;
  }

  return LANGUAGE_ALIASES[key] ?? null;
};

/** Opening fence: ``` optionally followed by a language tag, then end of line. */
const OPEN_FENCE = /^[ \t]*```([^\n`]*)$/;
/** Closing fence: ``` alone on its line. */
const CLOSE_FENCE = /^[ \t]*```[ \t]*$/;

const pushText = (segments: Segment[], lines: string[]): void => {
  if (lines.length === 0) return;
  const content = lines.join("\n");
  // A run of blank lines between two fences is not worth a paragraph.
  if (content.trim() === "") return;
  segments.push({ kind: "text", content });
};

/**
 * Turn a post body into ordered segments.
 *
 * The important failure mode is the unterminated fence. A student who types
 * three backticks mid-sentence and never closes them must see their post
 * exactly as it renders today — not watch the rest of it vanish into a grey
 * box. So an unclosed fence is rewound and emitted as literal text.
 */
export const splitCodeBlocks = (source: string): Segment[] => {
  if (!source) return [];

  const lines = source.split("\n");
  const segments: Segment[] = [];
  let text: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const open = OPEN_FENCE.exec(line);

    if (!open) {
      text.push(line);
      index += 1;
      continue;
    }

    // Look ahead for the closing fence before committing to a code segment.
    let close = -1;
    for (let scan = index + 1; scan < lines.length; scan += 1) {
      if (CLOSE_FENCE.test(lines[scan])) {
        close = scan;
        break;
      }
    }

    if (close === -1) {
      // Never closed — treat the fence and everything after it as prose.
      text.push(line);
      index += 1;
      continue;
    }

    pushText(segments, text);
    text = [];

    const tag = open[1].trim();
    segments.push({
      kind: "code",
      lang: tag === "" ? null : tag,
      content: lines.slice(index + 1, close).join("\n"),
    });

    index = close + 1;
  }

  pushText(segments, text);

  return segments;
};

/** True when a post contains at least one fenced block. */
export const hasCodeBlock = (source: string): boolean =>
  splitCodeBlocks(source).some((segment) => segment.kind === "code");

/**
 * Prose only, for list previews.
 *
 * A truncated code block in a card is noise, and highlighting one per card is
 * exactly the cost the lazy-loaded highlighter exists to avoid.
 */
export const stripCodeBlocks = (source: string): string =>
  splitCodeBlocks(source)
    .filter((segment): segment is Extract<Segment, { kind: "text" }> =>
      segment.kind === "text",
    )
    .map((segment) => segment.content)
    .join("\n")
    .trim();
