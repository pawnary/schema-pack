import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./vitest.setup.ts'],
    name: 'unit',
    include: ['./packages/**/__tests__/**/*.spec.ts'],
    exclude: ['./packages/schema-pack/**'],
    environment: 'jsdom',
  },
  resolve: {
    tsconfigPaths: true,
  },
});
