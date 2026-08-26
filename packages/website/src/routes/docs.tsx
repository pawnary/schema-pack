import { useFumadocsLoader } from 'fumadocs-core/source/client';
import { Callout } from 'fumadocs-ui/components/callout';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { use } from 'react';

import { useMDXComponents } from '@/components/mdx';
import { baseOptions } from '@/lib/layout.shared';
import { gitConfig, getPageImagePath } from '@/lib/shared';
import { docs, source } from '@/lib/source';

import type { Route } from './+types/docs';

export async function loader({ params }: Route.LoaderArgs) {
  const splat = params['*'] ?? '';
  const slugs = splat.split('/').filter((v) => v.length > 0);

  const page = source.getPage(slugs);
  if (!page) throw new Response('Not found', { status: 404 });

  return {
    path: page.path,
    pageTree: await source.serializePageTree(source.getPageTree()),
    imagePath: getPageImagePath(page.slugs, page.locale),
  };
}

function Content({ path, imagePath }: { path: string; imagePath: string }) {
  const page = docs.getPage(path);
  if (!page) throw new Error(`unknown page: ${path}`);

  // content is loaded lazily, call `page.preload()` in your loader to avoid suspending
  const { toc } = use(page.load());
  const Mdx = page.body;

  return (
    <DocsPage toc={toc}>
      <title>{page.title}</title>
      <meta
        name='description'
        content={page.description}
      />
      <meta
        property='og:image'
        content={imagePath}
      />
      <DocsTitle>{page.title}</DocsTitle>
      <DocsDescription className='flex justify-between items-center gap-2'>
        {page.description}
        <ViewOptionsPopover
          githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/docs/${path}`}
        />
      </DocsDescription>
      <DocsBody>
        <Callout
          type='warn'
          title='Work in progress'
        >
          This is a Work In Progress, and the API is not stable yet. Breaking
          changes may be introduced at any time.
        </Callout>
        <Mdx components={useMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { path, pageTree, imagePath } = useFumadocsLoader(loaderData);

  return (
    <DocsLayout
      {...baseOptions()}
      tree={pageTree}
    >
      <Content
        path={path}
        imagePath={imagePath}
      />
    </DocsLayout>
  );
}
