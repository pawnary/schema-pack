import { glob, rename } from 'node:fs/promises';

import type { Config } from '@react-router/dev/config';
import { createGetUrl, getSlugs } from 'fumadocs-core/source';

import { basename, isProd } from './src/constants.ts';
import { getPageImagePath, gitConfig } from './src/lib/shared.ts';

const getUrl = createGetUrl('/docs');

const config: Config = {
  appDirectory: 'src',
  basename,
  buildEnd: async (args): Promise<void> => {
    if (!isProd) {
      return;
    }

    const clientDirectory = `${args.reactRouterConfig.buildDirectory}/client`;

    const iterator = glob('*', {
      cwd: clientDirectory,
      exclude: [gitConfig.repo],
    });

    for await (const entry of iterator) {
      await rename(
        `${clientDirectory}/${entry}`,
        `${clientDirectory}/${gitConfig.repo}/${entry}`,
      );
    }
  },
  async prerender({ getStaticPaths }): Promise<string[]> {
    const paths: string[] = [];

    for (const path of getStaticPaths()) {
      paths.push(path);
    }

    for await (const entry of glob('**/*.mdx', { cwd: '../../docs' })) {
      const slugs = getSlugs(entry);

      paths.push(getUrl(slugs), getPageImagePath(slugs));
    }

    return paths;
  },
  ssr: false,
};

export default config;
