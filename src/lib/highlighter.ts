/**
 * Lazily-constructed Shiki highlighter (CC-22).
 *
 * Bundle size is the whole engineering concern here. Shiki's convenience
 * bundle carries every grammar and theme and is measured in megabytes, which
 * is not a reasonable thing to ship to a student on campus wifi so that code
 * looks nicer. So:
 *
 *   - the engine and grammars are behind dynamic import(), reached only when a
 *     post actually contains a fenced block;
 *   - only the nine languages on the engineering syllabus have grammars at all;
 *   - of those nine, only the ones actually used on the page are fetched;
 *   - one module-level promise is shared, so ten blocks on a page build one
 *     highlighter.
 *
 * Measured after `npm run build`: core 113 kB + engine 59 kB + one grammar
 * (python 70 kB), against ~1.5 MB if all nine were attached up front.
 *
 * See campus_cure_backend/docs/specs/CC-22-code-highlighting.md.
 */

import type { HighlighterCore } from "shiki/core";
import type { SupportedLanguage } from "./codeBlocks";

/**
 * Dual themes. Shiki emits both as CSS variables in a single render, so a
 * light/dark toggle is handled by CSS alone — no re-highlight, and no flash on
 * switch. `light` is the default and `dark` activates under the `.dark` class
 * that next-themes puts on <html>.
 */
const THEMES = { light: "github-light", dark: "github-dark" } as const;

let highlighterPromise: Promise<HighlighterCore> | null = null;

/**
 * Grammar loaders, one dynamic import each.
 *
 * Listed explicitly rather than built from a template string: a computed
 * specifier is opaque to the bundler, which would then either fail to split
 * these or inline all of them.
 *
 * Keep in sync with SUPPORTED_LANGUAGES in codeBlocks.ts.
 */
const GRAMMARS: Record<SupportedLanguage, () => Promise<unknown>> = {
  c: () => import("@shikijs/langs/c"),
  cpp: () => import("@shikijs/langs/cpp"),
  java: () => import("@shikijs/langs/java"),
  python: () => import("@shikijs/langs/python"),
  javascript: () => import("@shikijs/langs/javascript"),
  typescript: () => import("@shikijs/langs/typescript"),
  sql: () => import("@shikijs/langs/sql"),
  json: () => import("@shikijs/langs/json"),
  bash: () => import("@shikijs/langs/bash"),
};

/** Per-language load promises, so two blocks of one language load it once. */
const loaded = new Map<SupportedLanguage, Promise<void>>();

/**
 * Build (or reuse) the highlighter, with **no grammars**.
 *
 * Grammars are attached on demand by `ensureLanguage`. Passing them all to
 * `createHighlighterCore` would make the constructor await every one, so the
 * first Python block on the site would also pull C++ — whose grammar alone
 * minifies to ~800 kB. Measured across the nine: ~1.5 MB eagerly versus
 * ~240 kB for core + engine + one language.
 *
 * The JS regex engine avoids shipping the WASM Oniguruma binary, which is the
 * other half of why Shiki's default bundle is so heavy.
 */
export const getHighlighter = (): Promise<HighlighterCore> => {
  highlighterPromise ??= (async () => {
    const [{ createHighlighterCore }, { createJavaScriptRegexEngine }] =
      await Promise.all([
        import("shiki/core"),
        import("shiki/engine/javascript"),
      ]);

    return createHighlighterCore({
      themes: [
        import("@shikijs/themes/github-light"),
        import("@shikijs/themes/github-dark"),
      ],
      langs: [],
      engine: createJavaScriptRegexEngine(),
    });
  })();

  return highlighterPromise;
};

const ensureLanguage = async (lang: SupportedLanguage): Promise<void> => {
  let pending = loaded.get(lang);

  if (!pending) {
    pending = (async () => {
      const highlighter = await getHighlighter();
      await highlighter.loadLanguage(
        (await GRAMMARS[lang]()) as Parameters<
          HighlighterCore["loadLanguage"]
        >[0],
      );
    })();
    loaded.set(lang, pending);
  }

  return pending;
};

/**
 * Highlight one block to HTML.
 *
 * The returned string is generated from a TextMate grammar over the source
 * text — it is Shiki's own markup, not anything the user wrote — which is why
 * the caller may pass it to `dangerouslySetInnerHTML`. The user's text reaches
 * it only as escaped token content.
 */
export const highlightCode = async (
  code: string,
  lang: SupportedLanguage,
): Promise<string> => {
  await ensureLanguage(lang);
  const highlighter = await getHighlighter();

  return highlighter.codeToHtml(code, {
    lang,
    themes: THEMES,
    defaultColor: false,
  });
};

/** Test seam: forget the singleton so a fresh one is built. */
export const resetHighlighter = (): void => {
  highlighterPromise = null;
  loaded.clear();
};
