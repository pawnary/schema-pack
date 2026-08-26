import { glob } from 'node:fs/promises';

import type { Config } from '@react-router/dev/config';
import { createGetUrl, getSlugs } from 'fumadocs-core/source';

import { getPageImagePath } from './src/lib/shared';

const getUrl = createGetUrl('/docs');

export default {
  appDirectory: 'src',
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
} satisfies Config;
