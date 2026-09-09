import { defineConfig } from 'oxlint';

import baseOxlintConfig from '../../../oxlint.config.ts';

export default defineConfig({
  extends: [baseOxlintConfig],
  globals: {
    console: 'readonly',
  },
  rules: {
    'eslint/id-length': 'off',
    'eslint/max-classes-per-file': 'off',
    'eslint/no-console': 'off',
    'typescript/explicit-function-return-type': 'off',
    'unicorn/custom-error-definition': 'off',
  },
});
