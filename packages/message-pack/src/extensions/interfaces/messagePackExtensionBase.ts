import type MessagePackDecoder from '../../decoder/interfaces/messagePackDecoder.ts';
import type { Constructor } from './types.ts';

export default interface MessagePackExtensionBase<
  TValue extends object = object,
  TBuffer extends Uint8Array = Uint8Array,
> {
  /**
   * The unique type identifier for this extension. This value is used to
   * distinguish between different extensions during the encoding and decoding
   * process.
   */
  readonly type: number;

  /**
   * The constructor associated with this extension. This constructor is used to
   * create instances of the value type during decoding.
   */
  readonly constructors: Constructor<TValue> | Constructor<TValue>[];

  /**
   * Decodes a value from the provided decoder buffer starting at the specified
   * offset. The method should read the necessary bytes from the buffer,
   * reconstruct the original value, and return it.
   *
   * @param decoder - The decoder containing the encoded data to be decoded.
   * @param size - The number of bytes to read from the buffer for decoding.
   *
   * @returns The decoded value of type TValue.
   */
  decode(decoder: MessagePackDecoder<TBuffer>, size: number): TValue;
}
