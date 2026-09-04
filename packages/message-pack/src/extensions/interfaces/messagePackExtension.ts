import type MessagePackDecoderBuffer from '../../decoder/interfaces/messagePackDecoderBuffer.ts';
import type { ExtensionEncoder } from '../../encoder/types.ts';

// // oxlint-disable-next-line typescript/no-explicit-any
// export type ExtensionMatcher<TValue> = abstract new (...args: any[]) => TValue;

export default interface MessagePackExtension<
  TValue = unknown,
  TBuffer extends Uint8Array = Uint8Array,
> {
  /**
   * The unique type identifier for this extension. This value is used to
   * distinguish between different extensions during the encoding and decoding
   * process.
   */
  readonly type: number;
  // readonly matchers: ExtensionMatcher<TValue>[];

  /**
   * Encodes the given value into the provided buffer according to the
   * MessagePack format.
   *
   * @param value - The value to be encoded. This can be of any type, but the
   *   implementation should handle specific types as needed.
   * @param encoder - The extension encoder where the data will be written.
   */
  encode(value: object, encoder: ExtensionEncoder<TBuffer>): void;

  /**
   * Decodes a value from the provided DataView starting at the specified
   * offset. The method should read the necessary bytes from the DataView,
   * reconstruct the original value, and return it.
   *
   * @param decoderBuffer - The buffer containing the encoded data to be
   *   decoded.
   * @param size - The number of bytes to read from the buffer for decoding.
   *
   * @returns The decoded value of type TValue.
   */
  decode(decoderBuffer: MessagePackDecoderBuffer, size: number): TValue;
}
