import { defineConfig } from 'eslint/config';
import pawnary from '@pawnary/eslint-config-typescript';
import { eslintConfigPrettier } from '@pawnary/eslint-config-prettier';

export default defineConfig([
  {
    extends: [eslintConfigPrettier, pawnary],
    ignores: [
      'src/**',
      'packages/schema-pack/**',
      'packages/benchmark/__bench__/**',
    ],
  },
]);
