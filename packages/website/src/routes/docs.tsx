import {
  type SerializedPageTree,
  useFumadocsLoader,
} from 'fumadocs-core/source/client';
import { Callout } from 'fumadocs-ui/components/callout';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { type ReactNode, use } from 'react';

import { useMDXComponents } from '@/components/mdx.tsx';
import { baseOptions } from '@/lib/layout.shared.tsx';
import { getPageImagePath, gitConfig } from '@/lib/shared.ts';
import { docs, source } from '@/lib/source.ts';

import type { Route } from './+types/docs.ts';

function Content({
  path,
  imagePath,
}: {
  path: string;
  imagePath: string;
}): ReactNode {
  const page = docs.getPage(path);
  if (!page) {
    throw new Error(`unknown page: ${path}`);
  }

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

export default function Page({ loaderData }: Route.ComponentProps): ReactNode {
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

export async function loader({
  params,
}: Route.LoaderArgs): Promise<LoaderOutput> {
  // oxlint-disable-next-line typescript/no-unnecessary-condition
  const splat = params['*'] ?? '';
  const slugs = splat.split('/').filter((value) => value.length > 0);

  const page = source.getPage(slugs);
  if (!page) {
    throw new globalThis.Response('Not found', { status: 404 });
  }

  return {
    imagePath: getPageImagePath(page.slugs, page.locale),
    pageTree: await source.serializePageTree(source.getPageTree()),
    path: page.path,
  };
}

export interface LoaderOutput {
  imagePath: string;
  pageTree: SerializedPageTree;
  path: string;
}
