import type ErrorExtension from './extensions/error/error.ts';
import type { ErrorExtensionOptions } from './extensions/error/types.ts';
import type TimestampDateExtension from './extensions/timestampDate/timestampDate.ts';

interface ExtensionsOptions<TBuffer extends Uint8Array = Uint8Array> {
  /** Configuration options for the timestamp date extension. */
  timestampDate?: false | TimestampDateExtension<TBuffer>;
  /** Configuration options for the BigInt extension. */
  bigInt?: false | BigIntExtensionOptions;
  /** Configuration options for the error extension. */
  error?: false | ErrorExtensionOptions | ErrorExtension<TBuffer>;
}

export interface BigIntExtensionOptions {
  /**
   * The type identifier used for the BigInt extension.
   *
   * @default 0
   */
  type: number;
}

export interface BufferWithExtensionsOptions<
  TBuffer extends Uint8Array = Uint8Array,
> {
  /** Configuration options for the extensions used in the buffer. */
  extensions?: false | ExtensionsOptions<TBuffer>;
}

export type BufferFactory<TBuffer extends Uint8Array = Uint8Array> = (
  requiredSize: number,
) => TBuffer;

export interface BufferOptions<
  TBuffer extends Uint8Array = Uint8Array,
> extends BufferWithExtensionsOptions<TBuffer> {
  /**
   * The initial size of the buffer used for encoding. If the buffer is not
   * large enough to hold the encoded data, it will be automatically resized.
   *
   * @default 1024
   */
  initialBufferSize?: number;

  /**
   * A function that creates a new buffer of the specified size.
   *
   * @default (size) => new Uint8Array(size)
   */
  bufferFactory?: BufferFactory<TBuffer>;
}
