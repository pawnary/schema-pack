export type NewBufferFn<TBuffer extends Uint8Array = Uint8Array> = (
  requiredSize: number,
) => TBuffer;

export interface BufferOptions<TBuffer extends Uint8Array = Uint8Array> {
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
  newBufferFn?: NewBufferFn<TBuffer>;
}
