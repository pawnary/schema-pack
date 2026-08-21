import type { BufferOptions } from '../types.ts';
import type MessagePackEncoderBuffer from './interfaces/messagePackEncoderBuffer.ts';
import type MessagePackTextEncoder from './interfaces/messagePackTextEncoder.ts';

export interface EncoderBufferOptions<
  TBuffer extends Uint8Array = Uint8Array,
> extends BufferOptions<TBuffer> {
  /**
   * The initial size of the shared buffer. Shared buffer is used to encode
   * strings, to avoid allocating a new buffer for each string. This helps to
   * improve performance by reducing memory allocations and garbage collection
   * overhead.
   *
   * @default 1024
   */
  initialSharedBufferSize?: number;
  /**
   * A text encoder that will be used to encode strings into bytes.
   *
   * @default DefaultTextEncoder
   */
  textEncoder?: MessagePackTextEncoder<TBuffer>;
  /**
   * If true, the keys of objects will be sorted before encoding. This can be
   * useful for ensuring consistent encoding of objects with the same keys but
   * in different orders.
   *
   * @default false
   */
  sortKeys?: boolean;
  /**
   * If true, all floats will be encoded as float32, but it may result in loss
   * of precision for some floats (like `1.2`), this is a JavaScript
   * limitation.
   *
   * If false, floats will be encoded as float64, which is more precise but
   * takes up more space.
   *
   * Set to true only if you are sure that your floats can be represented as
   * float32 without loss of precision.
   *
   * @default false
   */
  forceFloat32?: boolean;
}

export type OmitByPattern<TRecord, Pattern extends string> = {
  [TKey in keyof TRecord as TKey extends Pattern ? never : TKey]: TRecord[TKey];
};

export type ExtensionEncoderBuffer<TBuffer extends Uint8Array = Uint8Array> =
  OmitByPattern<
    MessagePackEncoderBuffer<TBuffer>,
    `${string}Extension` | 'resetBuffer' | 'extensions'
  >;
