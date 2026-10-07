// Kept separate from vite.config.ts: rules tests are pure TypeScript and must
// not load the Cloudflare plugin, which conflicts with Vitest's own server.
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
});
