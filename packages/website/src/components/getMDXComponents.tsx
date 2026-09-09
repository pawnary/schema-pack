import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { TypeTable } from 'fumadocs-ui/components/type-table';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

import GithubSource from './GithubSource.tsx';

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}

export default function getMDXComponents(
  components?: MDXComponents,
): MDXComponents {
  return {
    ...defaultMdxComponents,
    CodeBlock,
    Pre,
    Tab,
    Tabs,
    TypeTable,
    ...components,
    GithubSource,
  };
}

// export const useMDXComponents = getMDXComponents;
