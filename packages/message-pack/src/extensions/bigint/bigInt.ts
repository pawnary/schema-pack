import type MessagePackDecoderBuffer from '../../decoder/interfaces/messagePackDecoderBuffer.ts';
import type { ExtensionEncoderBuffer } from '../../encoder/types.ts';
import UntypedExtension from '../../untypedExtension.ts';
import { BIGINT_MASK } from './constants.ts';

/**
 * This class encodes and decodes JavaScript BigInt values that are outside the
 * safe integer range. It encodes and decodes BigInt values using a custom
 * extension type, allowing for the serialization of large integers that cannot
 * be represented as standard JavaScript numbers. The encoding scheme uses a
 * variable-length representation to efficiently store the magnitude of the
 * BigInt value.
 */
class BigIntExtension<
  TBuffer extends Uint8Array = Uint8Array,
> extends UntypedExtension<bigint, TBuffer> {
  /**
   * Encodes a BigInt value into the provided buffer. If the value is within the
   * safe integer range, it is encoded directly following the Message Pack
   * specification. Otherwise, if the value is outside the safe integer range,
   * it is encoded using a variable-length representation. Negative values are
   * handled by encoding their magnitude and using a specific bit pattern to
   * indicate negativity.
   *
   * @param value - The BigInt value to encode.
   * @param buffer - The buffer to write the encoded data to.
   */
  encode(
    value: object | bigint,
    buffer: ExtensionEncoderBuffer<TBuffer>,
  ): void {
    if (typeof value === 'bigint') {
      let magnitude: bigint;

      if (value < 0n) {
        magnitude = (-value << 1n) - 1n;
      } else {
        magnitude = value << 1n;
      }

      while (magnitude > 0n) {
        buffer.ensureCapacity(8);
        buffer.view.setBigUint64(
          buffer.getOffset(),
          magnitude & BIGINT_MASK,
          false,
        );
        buffer.offset += 8;
        magnitude >>= 64n;
      }
    }
  }

  /**
   * Decodes a BigInt value from the provided DataView. It reads the encoded
   * data, reconstructs the magnitude, and determines the sign based on the
   * encoding scheme. The method returns the decoded BigInt value.
   */
  decode(buffer: MessagePackDecoderBuffer, size: number): bigint {
    let encoded = 0n;
    let shift = 0n;

    for (let i = buffer.offset; i < size; i += 8) {
      encoded |= buffer.view.getBigUint64(i, false) << shift;
      shift += 64n;
    }

    if ((encoded & 1n) === 1n) {
      return -((encoded + 1n) >> 1n);
    }

    return encoded >> 1n;
  }
}

export default BigIntExtension;
