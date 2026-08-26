import type { BufferOptions } from '../types.ts';

export type DecoderBufferOptions<TBuffer extends Uint8Array = Uint8Array> =
  Pick<BufferOptions<TBuffer>, 'bufferFactory'>;
