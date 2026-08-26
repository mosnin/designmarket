import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

/**
 * Node environment only. These tests cover the rules the catalogue is built
 * on — what may be shown as a fact, what an agent is handed, how a score is
 * computed — none of which involve a DOM. Rendering is verified by the render
 * layer itself, in a browser, where it means something.
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
