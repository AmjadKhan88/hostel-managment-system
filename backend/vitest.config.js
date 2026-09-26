import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    testTimeout: 20000, // in-memory MongoDB startup can be slow on first run
    hookTimeout: 30000,
  },
});
