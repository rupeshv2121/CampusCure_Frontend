/**
 * KaTeX rendering for stored math spans (CC-23).
 *
 * Rendered at READ time from the LaTeX source rather than stored as rendered
 * output: the source stays editable, and a KaTeX upgrade does not become a
 * data migration.
 *
 * Loaded dynamically, only when a post actually contains math - the same
 * reasoning CC-22 applied to Shiki. A student reading a prose thread should
 * not download a maths typesetter.
 */

export const MATH_SELECTOR = ".math-inline, .math-block";

/** True when a post carries math. Mirrors hasMath() on the server. */
export const containsMath = (html: string): boolean =>
  /class="math-(inline|block)"/.test(html);

let katexPromise: Promise<typeof import("katex")> | null = null;

const loadKatex = () => (katexPromise ??= import("katex"));

/**
 * Replace every math span's LaTeX source with rendered KaTeX.
 *
 * Idempotent: a span that has already been rendered is marked and skipped, so
 * a re-render on state change does not double-typeset.
 */
export const renderMathIn = async (root: HTMLElement): Promise<void> => {
  const spans = Array.from(
    root.querySelectorAll<HTMLElement>(MATH_SELECTOR),
  ).filter((span) => span.dataset.rendered !== "true");

  if (spans.length === 0) return;

  const katex = (await loadKatex()).default;

  for (const span of spans) {
    const latex = span.textContent ?? "";

    try {
      katex.render(latex, span, {
        displayMode: span.classList.contains("math-block"),
        // Never let a malformed formula throw away the rest of the post.
        throwOnError: false,
        output: "html",
      });
      span.dataset.rendered = "true";
    } catch {
      // Leave the LaTeX visible as text - a student can still read it, which
      // beats an empty space where their equation was.
      span.dataset.rendered = "true";
    }
  }
};
