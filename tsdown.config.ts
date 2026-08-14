import { defineConfig } from 'tsdown';

import { resolve } from 'node:path';

export default defineConfig({
  entry: 'src/**/*.ts',
  clean: true,
  dts: true,
  exports: true,
  publint: true,
  deps: {
    neverBundle: true,
  },
  format: ['cjs', 'esm'],
  workspace: {
    include: ['packages/*'],
    exclude: ['packages/schema-pack'],
  },
  plugins: [
    {
      /**
       * This plugin is used to set the output directory for each format,
       * otherwise the output directory (`dist`) will be the same for all formats.
       *
       * And if we use:
       *
       * ```
       * format: {
       *   esm: {
       *     outDir: 'dist/esm',
       *   },
       *   cjs: {
       *     outDir: 'dist/cjs',
       *   },
       * }
       * ```
       *
       * The package.json exports field will be generated as:
       *
       * ```
       *"exports": {
       *  ".": {
       *    "import": "./../../dist/esm/index.mjs" // <- WRONG PATH!, must be "./dist/esm/index.mjs"
       *  }
       *}
       * ```
       *
       * The output directory is set to `dist/esm` for the `esm` format and `dist/cjs` for the `cjs` format.
       */
      name: 'per-format-outdir',
      tsdownConfigResolved(config) {
        const folder = config.format === 'es' ? 'esm' : config.format;

        config.outDir = resolve(config.cwd, 'dist', folder);
      },
    },
  ],
});
