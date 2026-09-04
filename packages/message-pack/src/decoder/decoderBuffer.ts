// oxlint-disable typescript/no-unsafe-type-assertion complexity
import BufferWithExtensions from '../bufferWithExtensions.ts';
import defaultNewBufferFn from '../defaultNewBufferFn.ts';
import Symbols from '../symbols.ts';
import type MessagePackDecoderBuffer from './interfaces/messagePackDecoderBuffer.ts';
import DefaultTextDecoder from './textDecoders/defaultTextDecoder.ts';
import type { DecoderBufferOptions } from './types.ts';

class DecoderBuffer<TBuffer extends Uint8Array = Uint8Array>
  extends BufferWithExtensions<TBuffer>
  implements MessagePackDecoderBuffer<TBuffer>
{
  buffer: TBuffer;
  offset: number;
  view: DataView;
  textDecoder = new DefaultTextDecoder();

  constructor(options?: DecoderBufferOptions<TBuffer>) {
    super(options);

    const bufferFactory = options?.bufferFactory ?? defaultNewBufferFn<TBuffer>;

    this.buffer = bufferFactory(0);
    this.view = new DataView(this.buffer.buffer);
    this.offset = 0;
  }

  setBuffer(buffer: TBuffer): this {
    this.buffer = buffer;
    this.view = new DataView(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength,
    );
    this.offset = 0;

    return this;
  }

  readArray(elementCount: number): unknown[] {
    const decodedArray: unknown[] = new Array(elementCount);

    for (let index = 0; index < elementCount; index++) {
      decodedArray[index] = this.nextValue();
    }

    return decodedArray;
  }

  // NOTE: refactor this method?, too many loops.
  // ASCII fast path avoids allocating a subarray view + handing off to TextDecoder
  // (both measurably show up in profiling) for the overwhelmingly common case of
  // short ASCII keys/values; falls back to TextDecoder only when non-ASCII bytes appear.
  readStr(byteLength: number): string {
    if (byteLength === 0) {
      return '';
    }

    const { buffer } = this;
    const stringStartOffset = this.offset;
    const stringEndOffset = stringStartOffset + byteLength;
    this.offset = stringEndOffset;

    // Below the threshold, a manual scan + char-by-char build beats TextDecoder's fixed
    // per-call overhead (typical map keys/identifiers). Above it, the repeated string
    // concatenation itself becomes the bottleneck (StringAdd_CheckNone dominates in
    // profiling), so large strings skip straight to TextDecoder's native, single-pass decode.
    if (byteLength <= 64) {
      let isAsciiOnly = true;

      for (
        let byteIndex = stringStartOffset;
        byteIndex < stringEndOffset;
        byteIndex++
      ) {
        if (buffer[byteIndex] > 0x7f) {
          isAsciiOnly = false;
          break;
        }
      }

      if (isAsciiOnly) {
        let decodedString = '';

        for (
          let byteIndex = stringStartOffset;
          byteIndex < stringEndOffset;
          byteIndex++
        ) {
          // oxlint-disable-next-line unicorn/prefer-code-point -- check that
          decodedString += String.fromCharCode(buffer[byteIndex]);
        }

        return decodedString;
      }
    }

    return this.textDecoder.decode(buffer, stringStartOffset, stringEndOffset);
  }

  // Note: implements an efficient method to read map keys, avoiding the
  // overhead of nextValue() for the overwhelmingly common case of short ASCII
  // keys.
  readMapKey(): string | number {
    return this.nextValue<string | number>();
  }

  readMap(length: number): Record<string | number, unknown> {
    const decodedMap: Record<string | number, unknown> = {};

    for (let index = 0; index < length; ++index) {
      const mapKey = this.readMapKey();

      if (mapKey === '__proto__') {
        throw new Error(
          'Invalid map key: "__proto__" are not allowed as keys to prevent prototype pollution.',
        );
      }

      decodedMap[mapKey] = this.nextValue();
    }

    return decodedMap;
  }

  decodeBigInt(length: number): bigint {
    if (!this.bigIntExtensionEnabled) {
      throw new Error(`BigInt extension is disabled, cannot decode BigInt.`);
    }

    let encoded = 0n;
    let shift = 0n;

    for (let offset = this.offset; offset < length; offset += 8) {
      encoded |= this.view.getBigUint64(offset, false) << shift;
      shift += 64n;
    }

    if ((encoded & 1n) === 1n) {
      return -((encoded + 1n) >> 1n);
    }

    return encoded >> 1n;
  }

  // Cold path: everything in the 0xc0-0xdf control-code range that isn't Symbols.NIL/Symbols.FALSE/Symbols.TRUE/Symbols.UINT8/16/32.
  // Kept out of nextValue() on purpose (see comment above) so the hot switch stays small.
  decodeControlSlow(headerByte: number): unknown {
    const { buffer } = this;

    switch (headerByte) {
      case 0xc1: {
        // unassigned byte, historically decoded as undefined
        return undefined;
      }
      case Symbols.BIN8: {
        const byteLength = buffer[this.offset++];
        const dataStartOffset = this.offset;
        this.offset = dataStartOffset + byteLength;
        return buffer.subarray(dataStartOffset, this.offset);
      }
      case Symbols.BIN16: {
        const valueStartOffset = this.offset;
        const byteLength = this.view.getUint16(valueStartOffset);
        const dataStartOffset = valueStartOffset + 2;
        this.offset = dataStartOffset + byteLength;
        return buffer.subarray(dataStartOffset, this.offset);
      }
      case Symbols.BIN32: {
        const valueStartOffset = this.offset;
        const byteLength = this.view.getUint32(valueStartOffset);
        const dataStartOffset = valueStartOffset + 4;
        this.offset = dataStartOffset + byteLength;
        return buffer.subarray(dataStartOffset, this.offset);
      }
      case Symbols.EXT8: {
        const length = this.buffer[this.offset++];
        const extensionId = this.view.getInt8(this.offset++);

        if (extensionId === this.bigIntExtensionType) {
          return this.decodeBigInt(length);
        }

        const extension = this.fetchExtension(extensionId);

        return extension.decode(this, length);
      }
      case Symbols.EXT16: {
        const length = this.view.getInt16(this.offset);
        this.offset += 2;

        const extensionId = this.buffer[this.offset++];

        if (extensionId === this.bigIntExtensionType) {
          return this.decodeBigInt(length);
        }

        return this.fetchExtension(extensionId).decode(this, length);
      }
      case Symbols.EXT32: {
        const length = this.view.getInt32(this.offset);
        this.offset += 4;

        const extensionId = this.buffer[this.offset++];

        if (extensionId === this.bigIntExtensionType) {
          return this.decodeBigInt(length);
        }

        return this.fetchExtension(extensionId).decode(this, length);
      }
      case Symbols.FLOAT32: {
        const decodedFloat32 = this.view.getFloat32(this.offset);
        this.offset += 4;
        return decodedFloat32;
      }
      case Symbols.FLOAT64: {
        const decodedFloat64 = this.view.getFloat64(this.offset);
        this.offset += 8;
        return decodedFloat64;
      }
      case Symbols.UINT64: {
        const high = this.view.getUint32(this.offset);
        this.offset += 4;

        const low = this.view.getUint32(this.offset);
        this.offset += 4;

        return high * 0x1_00_00_00_00 + low;
      }
      case Symbols.INT8: {
        const decodedInt8 = this.view.getInt8(this.offset);
        this.offset += 1;
        return decodedInt8;
      }
      case Symbols.INT16: {
        const valueStartOffset = this.offset;
        const decodedInt16 = this.view.getInt16(valueStartOffset);
        this.offset = valueStartOffset + 2;
        return decodedInt16;
      }
      case Symbols.INT32: {
        const valueStartOffset = this.offset;
        const decodedInt32 = this.view.getInt32(valueStartOffset);
        this.offset = valueStartOffset + 4;
        return decodedInt32;
      }
      case Symbols.INT64: {
        const high = this.view.getInt32(this.offset);
        this.offset += 4;

        const low = this.view.getUint32(this.offset);
        this.offset += 4;

        return high * 0x1_00_00_00_00 + low;
      }
      case Symbols.FIXEXT1: {
        const extensionId = this.view.getInt8(this.offset++);

        return this.fetchExtension(extensionId).decode(this, 1);
      }
      case Symbols.FIXEXT2: {
        const extensionId = this.view.getInt8(this.offset++);

        return this.fetchExtension(extensionId).decode(this, 2);
      }
      case Symbols.FIXEXT4: {
        const extensionId = this.view.getInt8(this.offset++);

        return this.fetchExtension(extensionId).decode(this, 4);
      }
      case Symbols.FIXEXT8: {
        const extensionId = this.view.getInt8(this.offset++);

        if (extensionId === this.bigIntExtensionType) {
          return this.decodeBigInt(8);
        }

        return this.fetchExtension(extensionId).decode(this, 8);
      }
      case Symbols.FIXEXT16: {
        const extensionId = this.view.getInt8(this.offset++);

        if (extensionId === this.bigIntExtensionType) {
          return this.decodeBigInt(16);
        }

        return this.fetchExtension(extensionId).decode(this, 16);
      }
      case Symbols.STR8: {
        const byteLength = buffer[this.offset++];
        return this.readStr(byteLength);
      }
      case Symbols.STR16: {
        const valueStartOffset = this.offset;
        const byteLength = this.view.getUint16(valueStartOffset);
        this.offset = valueStartOffset + 2;
        return this.readStr(byteLength);
      }
      case Symbols.STR32: {
        const byteLength = this.view.getUint32(this.offset);
        this.offset += 4;
        return this.readStr(byteLength);
      }
      case Symbols.ARRAY16: {
        const valueStartOffset = this.offset;
        const elementCount = this.view.getUint16(valueStartOffset);
        this.offset = valueStartOffset + 2;
        return this.readArray(elementCount);
      }
      case Symbols.ARRAY32: {
        const valueStartOffset = this.offset;
        const elementCount = this.view.getUint32(valueStartOffset);
        this.offset = valueStartOffset + 4;
        return this.readArray(elementCount);
      }
      case Symbols.MAP16: {
        const valueStartOffset = this.offset;
        const length = this.view.getUint16(valueStartOffset);
        this.offset = valueStartOffset + 2;
        return this.readMap(length);
      }
      case Symbols.MAP32: {
        const length = this.view.getUint32(this.offset);
        this.offset += 4;
        return this.readMap(length);
      }
      default: {
        return undefined;
      }
    }
  }

  // Dispatch is split in two tiers: a handful of range checks to bucket `headerByte`
  // into { fixint/fixmap/fixarray/fixstr } vs { control codes 0xc0-0xdf ∪ negative fixint },
  // then a small switch covering only the control codes this benchmark actually hits.
  // Kept deliberately tiny (unlike a single flat 32-case switch) so V8's inliner can fold
  // it into readArray's loop; everything rare/unimplemented is deferred to decodeControlSlow
  // so it doesn't bloat this function's inlining budget.
  nextValue<TValue = unknown>(): TValue {
    const { buffer } = this;
    const headerByte = buffer[this.offset++];

    if ((headerByte & 0xe0) === Symbols.NIL) {
      // 0xc0-0xdf control codes, single bitmask test
      switch (headerByte) {
        case Symbols.NIL: {
          return null as TValue;
        }
        case Symbols.FALSE: {
          return false as TValue;
        }
        case Symbols.TRUE: {
          return true as TValue;
        }
        case Symbols.UINT8: {
          return buffer[this.offset++] as TValue;
        }
        case Symbols.UINT16: {
          const valueStartOffset = this.offset;
          const decodedUint16 =
            (buffer[valueStartOffset] << 8) | buffer[valueStartOffset + 1];
          this.offset = valueStartOffset + 2;
          return decodedUint16 as TValue;
        }
        case Symbols.UINT32: {
          const decodedUint32 = this.view.getUint32(this.offset);
          this.offset += 4;
          return decodedUint32 as TValue;
        }
        default: {
          return this.decodeControlSlow(headerByte) as TValue;
        }
      }
    }

    if (headerByte >= Symbols.NEGATIVE_FIXINT_START) {
      return (headerByte - 0x1_00) as TValue;
    }

    if (headerByte < Symbols.FIXARRAY_START) {
      if (headerByte < Symbols.FIXMAP_START) {
        return headerByte as TValue; // POSITIVE_FIXINT
      }

      // Symbols.FIXMAP_START
      return this.readMap(headerByte & 0b1111) as TValue;
    }

    if (headerByte < Symbols.FIXSTR_START) {
      const elementCount = headerByte & 0b1111;

      return this.readArray(elementCount) as TValue;
    }

    // Symbols.FIXSTR_START
    return this.readStr(headerByte & 0b1_1111) as TValue;
  }
}

export default DecoderBuffer;
