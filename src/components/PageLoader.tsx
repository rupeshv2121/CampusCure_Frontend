/**
 * Route-level suspense fallback.
 *
 * Deliberately not an AntD `Spin`: this renders while a lazy chunk is still
 * downloading, and pulling the whole AntD bundle in to draw a spinner defeats
 * the code-splitting it is covering for. The mark below is plain CSS.
 */
const PageLoader = () => (
  <div
    role="status"
    aria-live="polite"
    className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background"
  >
    <span className="relative flex h-12 w-12">
      <span className="absolute inset-0 rounded-full border-2 border-border" />
      <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary" />
    </span>

    <span className="font-display text-sm font-semibold tracking-tight text-muted-foreground">
      Loading<span className="animate-pulse">…</span>
    </span>
  </div>
);

export default PageLoader;
