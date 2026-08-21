import type MessagePackDecoderBuffer from '../../decoder/interfaces/messagePackDecoderBuffer.ts';
import type MessagePackEncoderBuffer from '../../encoder/interfaces/messagePackEncoderBuffer.ts';
import type MessagePackExtension from '../interfaces/messagePackExtension.ts';
import type { MessagePackTime } from './types.ts';

const TIMESTAMP32_MAX_SEC = 0x1_00_00_00_00 - 1; // 32-bit unsigned int // 4_294_967_295
const TIMESTAMP64_MAX_SEC = 0x4_00_00_00_00 - 1; // 34-bit unsigned int // 17_179_869_183

/**
 * The `TimestampDateExtension` class is responsible for encoding JavaScript
 * `Date` objects into the MessagePack timestamp format.
 *
 * Timestamp extension type is assigned to extension type -1. It defines 3
 * formats: 32-bit format, 64-bit format, and 96-bit format.
 *
 * - Timestamp 32 format can represent a timestamp in [1970-01-01 00:00:00 UTC,
 *   2106-02-07 06:28:16 UTC) range. Nanoseconds part is 0.
 * - Timestamp 64 format can represent a timestamp in [1970-01-01
 *   00:00:00.000000000 UTC, 2514-05-30 01:53:04.000000000 UTC) range.
 * - Timestamp 96 format can represent a timestamp in [-292277022657-01-27
 *   08:29:52 UTC, 292277026596-12-04 15:30:08.000000000 UTC) range.
 * - In timestamp 64 and timestamp 96 formats, nanoseconds must not be larger than
 *   999999999.
 *
 * @see https://github.com/msgpack/msgpack/blob/master/spec.md#timestamp-extension-type
 * @see https://github.com/msgpack/msgpack-javascript/blob/main/src/timestamp.ts
 * @see https://github.com/msgpack/msgpack-javascript/issues/216
 */
class TimestampDateExtension<
  TBuffer extends Uint8Array = Uint8Array,
> implements MessagePackExtension<Date, TBuffer> {
  readonly type = -1;

  parseToMessagePackTime(date: Date): MessagePackTime {
    const msec = date.getTime();
    const sec = Math.floor(msec / 1e3);
    const nsec = (msec - sec * 1e3) * 1e6;

    // Normalizes { sec, nsec } to ensure nsec is unsigned.
    const nsecInSec = Math.floor(nsec / 1e9);

    return {
      nsec: nsec - nsecInSec * 1e9,
      sec: sec + nsecInSec,
    };
  }

  encode(
    value: object | bigint,
    buffer: MessagePackEncoderBuffer<TBuffer>,
  ): void {
    if (value instanceof Date) {
      const time = this.parseToMessagePackTime(value);

      if (time.sec >= 0 && time.nsec >= 0 && time.sec <= TIMESTAMP64_MAX_SEC) {
        // Here sec >= 0 && nsec >= 0
        if (time.nsec === 0 && time.sec <= TIMESTAMP32_MAX_SEC) {
          buffer.writeUint32(time.sec);
        } else {
          // timestamp 64 = { nsec30 (unsigned), sec34 (unsigned) }
          const secHigh = time.sec / 0x1_00_00_00_00;
          const secLow = time.sec & 0xff_ff_ff_ff;
          buffer.writeUint32((time.nsec << 2) | (secHigh & 0x3));
          buffer.writeUint32(secLow);
        }
      } else {
        buffer.writeUint32(time.nsec);
        buffer.writeInt64(time.sec);
      }
    }
  }

  decode(decoderBuffer: MessagePackDecoderBuffer<TBuffer>, size: number): Date {
    const byteOffset = decoderBuffer.offset;

    switch (size) {
      case 4: {
        // timestamp 32 = { sec32 }
        const sec = decoderBuffer.view.getUint32(byteOffset);
        const nsec = 0;
        // return { sec, nsec };
        return new Date(sec * 1e3 + nsec / 1e6);
      }
      case 8: {
        // timestamp 64 = { nsec30, sec34 }
        const nsec30AndSecHigh2 = decoderBuffer.view.getUint32(byteOffset);
        const secLow32 = decoderBuffer.view.getUint32(byteOffset + 4);
        const sec = (nsec30AndSecHigh2 & 0x3) * 0x1_00_00_00_00 + secLow32;
        const nsec = nsec30AndSecHigh2 >>> 2;
        return new Date(sec * 1e3 + nsec / 1e6);
      }
      case 12: {
        // timestamp 96 = { nsec32 (unsigned), sec64 (signed) }
        const high = decoderBuffer.view.getInt32(byteOffset + 4);
        const low = decoderBuffer.view.getUint32(byteOffset + 8);

        // const sec = getInt64(view, 4);
        const sec = high * 0x1_00_00_00_00 + low;
        const nsec = decoderBuffer.view.getUint32(byteOffset);
        return new Date(sec * 1e3 + nsec / 1e6);
      }
      default: {
        throw new Error(
          `Unrecognized data size for timestamp (expected 4, 8, or 12): ${decoderBuffer.view.byteLength}`,
        );
      }
    }
  }
}

export default TimestampDateExtension;
