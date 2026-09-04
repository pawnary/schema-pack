import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

import { appName, gitConfig } from './shared.ts';

// oxlint-disable-next-line import/prefer-default-export
export function baseOptions(): BaseLayoutProps {
  return {
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    nav: {
      title: appName,
    },
  };
}
