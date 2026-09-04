import { loader } from 'fumadocs-core/source';
import { defineDocs } from 'fumadocs-mdx/macro';

import { docsRoute } from './shared.ts';

export const docs = defineDocs({
  dir: '../../docs',
  docs: {
    async: true,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});

export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
});

export interface PageMarkdownUrl {
  segments: string[];
  url: string;
}

export function getPageMarkdownUrl(
  page: (typeof source)['$inferPage'],
): PageMarkdownUrl {
  const segments = [...page.slugs, 'content.md'];

  return {
    segments,
    url: `/${[page.locale, ...segments].filter(Boolean).join('/')}`,
  };
}

export async function getLLMText(
  page: (typeof source)['$inferPage'],
): Promise<string> {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title} (${page.url})

${processed}`;
}
