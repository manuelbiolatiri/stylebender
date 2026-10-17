import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Match the @/* path alias already defined for Next.js and TypeScript.
// Without this, Vitest cannot load API route imports such as "@/auth".
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
});
