import { defineConfig } from 'oxlint';

import baseOxlintConfig from '../../oxlint.config.ts';

export default defineConfig({
  ...baseOxlintConfig,
  rules: {
    ...baseOxlintConfig.rules,
    'unicorn/filename-case': 'off',
  },
});
