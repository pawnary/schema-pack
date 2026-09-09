import { defineConfig } from 'knip/config';

export default defineConfig({
  ignore: [
    './packages/benchmark/__bench__/**',
    './packages/benchmark/src/spbench/**',
    './packages/**/examples/**',
    './packages/schema-pack/**',
    './packages/website/.react-router/**',
    './src/**',
  ],
});
