import type { BufferOptions } from '../types.ts';
import type MessagePackTextDecoder from './interfaces/messagePackTextDecoder.ts';

export type DecoderBufferOptions<TBuffer extends Uint8Array = Uint8Array> =
  Pick<BufferOptions<TBuffer>, 'bufferFactory'> & {
    textDecoder?: MessagePackTextDecoder<TBuffer>;
  };
