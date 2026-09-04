import { defineConfig } from '@pawnary/oxfmt-config';

export default defineConfig({
  ignorePatterns: [
    'packages/schema-pack/**',
    'src/**',
    'packages/benchmark/__bench__/**',
    'packages/website/.react-router/**',
  ],
});
