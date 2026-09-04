import { defineConfig } from 'oxlint';

import baseOxlintConfig from '../../oxlint.config.ts';

const { ignorePatterns: _ignorePatterns, ...base } = baseOxlintConfig;

export default defineConfig({
  ...base,
  rules: {
    ...base.rules,
    'typescript/only-throw-error': 'off',
    'unicorn/filename-case': 'off',
  },
});
