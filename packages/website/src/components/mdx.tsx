import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    CodeBlock,
    Pre,
    Tab,
    Tabs,
    ...components,
  };
}

export const useMDXComponents = getMDXComponents;
