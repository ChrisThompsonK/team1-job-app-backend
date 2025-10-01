/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Test environment
    environment: "node",

    // Test file patterns
    include: ["src/**/*.{test,spec}.{js,ts}"],
    exclude: ["dist/**", "node_modules/**"],

    // Enable TypeScript support
    typecheck: {
      enabled: false, // Set to true if you want to type-check tests
    },

    // Global test setup
    globals: false, // Prefer explicit imports for better tree-shaking

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "dist/**",
        "node_modules/**",
        "**/*.d.ts",
        "**/*.config.{js,ts}",
        "**/vitest.config.{js,ts}",
      ],
    },

    // Watch mode configuration
    watch: true,

    // Reporter configuration
    reporters: ["verbose"],

    // Test timeout
    testTimeout: 10000,
    hookTimeout: 10000,

    // Vitest pool configuration for better performance
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },

    // Mock configuration
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,
  },
});