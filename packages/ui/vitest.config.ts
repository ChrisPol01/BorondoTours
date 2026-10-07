import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Tests de componentes de @borondo/ui en jsdom (Testing Library).
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
