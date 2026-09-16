import type { BufferOptions } from '../types.ts';
import type MessagePackTextDecoder from './interfaces/messagePackTextDecoder.ts';

export type DecoderOptions<TBuffer extends Uint8Array = Uint8Array> = Omit<
  BufferOptions<TBuffer>,
  'initialBufferSize'
> & {
  /**
   * The TextDecoder instance used for decoding strings.
   *
   * @default DefaultTextDecoder
   */
  textDecoder?: MessagePackTextDecoder<TBuffer>;
  /**
   * Whether to copy buffers when decoding binary data instead of returning
   * subarrays.
   *
   * @default false
   */
  copyBuffers?: boolean;
};
