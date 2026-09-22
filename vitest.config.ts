/**
 * Frontend unit tests (added by CC-22).
 *
 * Deliberately minimal: no jsdom, no setup file, no component harness. The one
 * thing here that carries real edge cases is the code-fence parser, and it is
 * a pure function. A full component-testing setup is worth doing when there is
 * something that needs it — building it speculatively is how test harnesses
 * end up unused.
 */
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
