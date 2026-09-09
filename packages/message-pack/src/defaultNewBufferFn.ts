import type { BufferFactory } from './types.ts';

const defaultNewBufferFn: BufferFactory = (requiredSize) =>
  new Uint8Array(requiredSize);

export default defaultNewBufferFn;
