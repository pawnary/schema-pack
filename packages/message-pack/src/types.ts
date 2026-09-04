export interface BufferWithExtensionsOptions {
  /** Configuration options for the BigInt extension. */
  bigIntExtension?: {
    /**
     * Whether the BigInt extension is enabled.
     *
     * @default true
     */
    enabled?: boolean;
    /**
     * The type identifier used for the BigInt extension.
     *
     * @default 0
     */
    type?: number;
  };
}

export type BufferFactory<TBuffer extends Uint8Array = Uint8Array> = (
  requiredSize: number,
) => TBuffer;

export interface BufferOptions<
  TBuffer extends Uint8Array = Uint8Array,
> extends BufferWithExtensionsOptions {
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
