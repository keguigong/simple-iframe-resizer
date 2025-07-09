import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    dir: ".",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./vitest-setup.mts"],
    environment: "jsdom",
  },
})
