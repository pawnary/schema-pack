import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { fumadocsMdx } from 'fumadocs-mdx/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: ['tsconfig.json', '../../tsconfig.json'],
    }),
    fumadocsMdx(),
    tailwindcss(),
    reactRouter(),
  ],
  publicDir: 'public',
});
