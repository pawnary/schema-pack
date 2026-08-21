import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'jsdom',
    exclude: ['./packages/schema-pack/**'],
    include: ['./packages/**/__tests__/**/*.spec.ts'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
