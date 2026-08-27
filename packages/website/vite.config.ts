import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { fumadocsMdx } from 'fumadocs-mdx/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import { assetsDir } from './src/constants.ts';

export default defineConfig({
  build: {
    assetsDir,
  },
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
