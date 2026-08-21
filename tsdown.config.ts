import tsdownFixExports from '@pawnary/tsdown-fix-exports';
import { defineConfig } from 'tsdown';

export default defineConfig({
  clean: true,
  deps: {
    neverBundle: true,
  },
  dts: true,
  entry: 'src/**/*.ts',
  exports: true,
  format: ['cjs', 'esm'],
  plugins: [tsdownFixExports()],
  publint: true,
  workspace: {
    exclude: ['packages/schema-pack'],
    include: ['packages/*'],
  },
});
