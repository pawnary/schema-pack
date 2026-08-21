import pawnary from '@pawnary/oxlint-config';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [pawnary],
  globals: {
    Buffer: 'readonly',
    Bun: 'readonly',
    TextDecoder: 'readonly',
    TextEncoder: 'readonly',
    console: 'readonly',
    process: 'readonly',
  },
  ignorePatterns: [
    'packages/schema-pack/**',
    'src/**',
    'packages/benchmark/__bench__/**',
  ],
  rules: {
    'eslint/max-lines': 'off',
    'eslint/max-lines-per-function': 'off',
    'eslint/max-statements': 'off',
    'eslint/no-bitwise': 'off',
  },
});
