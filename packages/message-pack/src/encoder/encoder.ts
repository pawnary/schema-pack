// oxlint-disable unicorn/prefer-code-point
import BufferWithExtensions from '../bufferWithExtensions.ts';
import {
  DEFAULT_ALLOCATION_SIZE,
  INT64_MIN,
  UINT32_MAX,
  UINT64_MAX,
} from '../constants.ts';
import defaultNewBufferFn from '../defaultNewBufferFn.ts';
import type MessagePackExtension from '../extensions/interfaces/messagePackExtension.ts';
import Symbols from '../symbols.ts';
import type { BufferFactory } from '../types.ts';
import fitIn7Bits from '../utils/fitIn7Bits.ts';
import fitIn8Bits from '../utils/fitIn8Bits.ts';
import fitIn16Bits from '../utils/fitIn16Bits.ts';
import fitIn32Bits from '../utils/fitIn32Bits.ts';
import type {
  MessagePackEncoder,
  MessagePackTextEncoder,
} from './interfaces/index.ts';
import DefaultTextEncoder from './textEncoders/defaultTextEncoder.ts';
import type { EncoderOptions, ExtensionEncoder } from './types.ts';

class Encoder<TBuffer extends Uint8Array = Uint8Array>
  extends BufferWithExtensions<TBuffer>
  implements MessagePackEncoder<TBuffer>
{
  /** The current offset in the buffer where the next write operation will occur. */
  offset: number;

  /**
   * Shared buffer is used to encode strings, to avoid allocating a new buffer
   * for each string. The shared buffer is resized if the string is larger than
   * the current size of the shared buffer. This helps to improve performance by
   * reducing memory allocations and garbage collection overhead.
   */
  protected sharedBuffer: TBuffer;

  /**
   * Determines whether the keys of a map should be sorted before encoding.
   * Sorting keys can be useful for ensuring consistent serialization of
   * objects, which is important for tasks like hashing or comparing serialized
   * data.
   */
  readonly sortKeys: boolean;

  /**
   * If true, forces the encoder to use 32-bit floating point representation for
   * numbers, even if they could be represented as 64-bit floats. This can be
   * useful for reducing the size of the encoded data when high precision is not
   * required. However, it may lead to loss of precision for very large or very
   * small numbers.
   */
  readonly forceFloat32: boolean;

  /**
   * A function that creates a new buffer of the specified size. This function
   * is used to allocate new buffers when the current buffer is not large enough
   * to accommodate the data being written. The function should return a new
   * instance of TBuffer with the specified size.
   */
  protected bufferFactory: BufferFactory<TBuffer>;

  readonly textEncoder: MessagePackTextEncoder<TBuffer>;

  buffer: TBuffer;
  view: DataView;

  /**
   * The extension encoder is used to encode extension types. It is a separate
   * buffer from the main buffer, and is used to encode the extension data
   * before writing it to the main buffer. This allows for efficient encoding of
   * extension types, as the extension data can be encoded in a separate buffer
   * and then written to the main buffer in a single operation.
   *
   * The extension buffer must be resized using ensureCapacity before writing to
   * it, to ensure that there is enough space for the extension data.
   */
  #extensionEncoder?: Encoder<TBuffer>;

  constructor(options?: Partial<EncoderOptions<TBuffer>>) {
    super();

    this.offset = 0;
    this.textEncoder = options?.textEncoder ?? new DefaultTextEncoder();

    this.bufferFactory = options?.bufferFactory ?? defaultNewBufferFn<TBuffer>;

    this.buffer = this.bufferFactory(
      options?.initialBufferSize ?? DEFAULT_ALLOCATION_SIZE,
    );
    this.sharedBuffer = this.bufferFactory(
      options?.initialSharedBufferSize ?? DEFAULT_ALLOCATION_SIZE,
    );
    this.view = new DataView(
      this.buffer.buffer,
      this.buffer.byteOffset,
      this.buffer.byteLength,
    );

    this.sortKeys = options?.sortKeys ?? false;
    this.forceFloat32 = options?.forceFloat32 ?? false;
  }

  getExtensionEncoder(): Encoder<TBuffer> {
    if (!this.#extensionEncoder) {
      this.#extensionEncoder = new Encoder<TBuffer>({
        bufferFactory: this.bufferFactory,
        initialBufferSize: this.sharedBuffer.byteLength,
        initialSharedBufferSize: 0,
        sortKeys: this.sortKeys,
        textEncoder: this.textEncoder,
      });
    }

    return this.#extensionEncoder;
  }

  resizeBuffer(newSize: number): this {
    const newBuffer = this.bufferFactory(newSize);

    newBuffer.set(this.buffer);

    this.buffer = newBuffer;
    this.view = new DataView(
      this.buffer.buffer,
      this.buffer.byteOffset,
      this.buffer.byteLength,
    );

    return this;
  }

  ensureCapacity(sizeToWrite: number): this {
    const required = this.offset + sizeToWrite;

    if (this.buffer.byteLength < required) {
      this.resizeBuffer(required * 2);
    }

    return this;
  }

  resetBuffer(): this {
    this.offset = 0;

    return this;
  }

  flush(): TBuffer {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const buffer = this.buffer.subarray(0, this.offset) as TBuffer;

    this.resetBuffer();

    return buffer;
  }

  writePositiveFixInt(value: number): this {
    this.writeUint8(value);

    return this;
  }

  writeNegativeFixInt(value: number): this {
    // this.buffer[this.offset++] = NEGATIVE_FIXINT_START | (value + 32);
    this.buffer[this.offset++] = value + 0x1_00;

    return this;
  }

  writeBin(bytes: Uint8Array): this {
    this.buffer.set(bytes, this.offset);

    this.offset += bytes.length;

    return this;
  }

  writeFloat32(value: number): this {
    this.view.setFloat32(this.offset, value);
    this.offset += 4;

    return this;
  }

  writeFloat64(value: number): this {
    this.view.setFloat64(this.offset, value);
    this.offset += 8;

    return this;
  }

  writeUint8(value: number): this {
    this.buffer[this.offset++] = value;

    return this;
  }

  writeUint16(value: number): this {
    this.view.setUint16(this.offset, value);
    this.offset += 2;

    return this;
  }

  writeUint32(value: number): this {
    this.view.setUint32(this.offset, value);
    this.offset += 4;

    return this;
  }

  writeUint64(value: number): this {
    const high = value / 0x1_00_00_00_00;
    const low = value;

    this.view.setUint32(this.offset, high);
    this.offset += 4;

    this.view.setUint32(this.offset, low);
    this.offset += 4;

    return this;
  }

  writeInt8(value: number): this {
    this.view.setInt8(this.offset++, value & 0xff);

    return this;
  }

  writeInt16(value: number): this {
    this.view.setInt16(this.offset, value);
    this.offset += 2;

    return this;
  }

  writeInt32(value: number): this {
    this.view.setInt32(this.offset, value);
    this.offset += 4;

    return this;
  }

  writeInt64(value: number): this {
    const high = Math.floor(value / 0x1_00_00_00_00);
    const low = value;

    this.view.setInt32(this.offset, high);
    this.offset += 4;
    this.view.setInt32(this.offset, low);
    this.offset += 4;

    return this;
  }

  // writeBigInt64(value: bigint): this {
  //   this.view.setBigInt64(this.offset, value);
  //   this.offset += 8;

  //   return this;
  // }

  // writeBigUint64(value: bigint): this {
  //   this.view.setBigUint64(this.offset, value);
  //   this.offset += 8;

  //   return this;
  // }

  writeStr(value: string): this {
    this.offset += this.textEncoder.writeBytes(value, this.buffer);

    return this;
  }

  writeNilSymbol(): this {
    this.buffer[this.offset++] = Symbols.NIL;

    return this;
  }

  writeFalseSymbol(): this {
    this.buffer[this.offset++] = Symbols.FALSE;

    return this;
  }

  writeTrueSymbol(): this {
    this.buffer[this.offset++] = Symbols.TRUE;

    return this;
  }

  writeFixMapSymbol(keysSize: number): this {
    this.buffer[this.offset++] = Symbols.FIXMAP_START | keysSize;

    return this;
  }

  writeFixArraySymbol(arraySize: number): this {
    this.buffer[this.offset++] = Symbols.FIXARRAY_START | arraySize;

    return this;
  }

  writeFixStrSymbol(byteLength: number): this {
    this.buffer[this.offset++] = Symbols.FIXSTR_START | byteLength;

    return this;
  }

  writeBin8Symbol(size: number): this {
    this.buffer[this.offset++] = Symbols.BIN8;
    this.buffer[this.offset++] = size;

    return this;
  }

  writeBin16Symbol(size: number): this {
    this.buffer[this.offset++] = Symbols.BIN16;
    this.view.setUint16(this.offset, size);
    this.offset += 2;

    return this;
  }

  writeBin32Symbol(size: number): this {
    this.buffer[this.offset++] = Symbols.BIN32;
    this.view.setUint32(this.offset, size);
    this.offset += 4;

    return this;
  }

  writeFloat32Symbol(): this {
    this.buffer[this.offset++] = Symbols.FLOAT32;

    return this;
  }

  writeFloat64Symbol(): this {
    this.buffer[this.offset++] = Symbols.FLOAT64;

    return this;
  }

  writeUint8Symbol(): this {
    this.buffer[this.offset++] = Symbols.UINT8;

    return this;
  }

  writeUint16Symbol(): this {
    this.buffer[this.offset++] = Symbols.UINT16;

    return this;
  }

  writeUint32Symbol(): this {
    this.buffer[this.offset++] = Symbols.UINT32;

    return this;
  }

  writeUint64Symbol(): this {
    this.buffer[this.offset++] = Symbols.UINT64;

    return this;
  }

  writeInt8Symbol(): this {
    this.buffer[this.offset++] = Symbols.INT8;

    return this;
  }

  writeInt16Symbol(): this {
    this.buffer[this.offset++] = Symbols.INT16;

    return this;
  }

  writeInt32Symbol(): this {
    this.buffer[this.offset++] = Symbols.INT32;

    return this;
  }

  writeInt64Symbol(): this {
    this.buffer[this.offset++] = Symbols.INT64;

    return this;
  }

  writeStr8Symbol(size: number): this {
    this.buffer[this.offset++] = Symbols.STR8;
    this.buffer[this.offset++] = size;

    return this;
  }

  writeStr16Symbol(size: number): this {
    this.buffer[this.offset++] = Symbols.STR16;
    this.view.setUint16(this.offset, size);

    this.offset += 2;

    return this;
  }

  writeStr32Symbol(size: number): this {
    this.buffer[this.offset++] = Symbols.STR32;
    this.view.setUint32(this.offset, size);

    this.offset += 4;

    return this;
  }

  writeArray16Symbol(size: number): this {
    this.buffer[this.offset++] = Symbols.ARRAY16;
    this.view.setUint16(this.offset, size);

    this.offset += 2;

    return this;
  }

  writeArray32Symbol(size: number): this {
    this.buffer[this.offset++] = Symbols.ARRAY32;
    this.view.setUint32(this.offset, size);

    this.offset += 4;

    return this;
  }

  writeMap16Symbol(size: number): this {
    this.buffer[this.offset++] = Symbols.MAP16;
    this.view.setUint16(this.offset, size);

    this.offset += 2;

    return this;
  }

  writeMap32Symbol(size: number): this {
    this.buffer[this.offset++] = Symbols.MAP32;
    this.view.setUint32(this.offset, size);

    this.offset += 4;

    return this;
  }

  writeFixExt1Symbol(type: number): this {
    this.buffer[this.offset++] = Symbols.FIXEXT1;
    this.buffer[this.offset++] = type;

    return this;
  }

  writeFixExt2Symbol(type: number): this {
    this.buffer[this.offset++] = Symbols.FIXEXT2;
    this.buffer[this.offset++] = type;

    return this;
  }

  writeFixExt4Symbol(type: number): this {
    this.buffer[this.offset++] = Symbols.FIXEXT4;
    this.buffer[this.offset++] = type;

    return this;
  }

  writeFixExt8Symbol(type: number): this {
    this.buffer[this.offset++] = Symbols.FIXEXT8;
    this.buffer[this.offset++] = type;

    return this;
  }

  writeFixExt16Symbol(type: number): this {
    this.buffer[this.offset++] = Symbols.FIXEXT16;
    this.buffer[this.offset++] = type;

    return this;
  }

  writeExt8Symbol(type: number, size: number): this {
    this.buffer[this.offset++] = Symbols.EXT8;
    this.buffer[this.offset++] = size;
    this.buffer[this.offset++] = type;

    return this;
  }

  writeExt16Symbol(type: number, size: number): this {
    this.buffer[this.offset++] = Symbols.EXT16;

    this.view.setUint16(this.offset, size);
    this.offset += 2;

    this.buffer[this.offset++] = type;

    return this;
  }

  writeExt32Symbol(type: number, size: number): this {
    this.buffer[this.offset++] = Symbols.EXT32;

    this.view.setUint32(this.offset, size);
    this.offset += 4;

    this.buffer[this.offset++] = type;

    return this;
  }

  writeString(value: string): this {
    const valueLength = value.length;
    const requiredSize = value.length * 4;

    // optimization for short strings, to avoid the overhead of using
    // a text encoder for small strings
    if (valueLength < 51) {
      this.ensureCapacity(1 + requiredSize);

      const initialoffset = this.offset;
      const byteLengthoffset = this.offset++;
      let totalBytes = 0;
      let fitInFixStr = true;
      let fitInStr8 = true;
      let { offset } = this;

      for (let index = 0; index < valueLength; index++) {
        const code = value.charCodeAt(index);

        if (code < 0x80) {
          this.buffer[offset++] = code;
          totalBytes++;
        } else if (code < 0x8_00) {
          this.buffer[offset++] = 0xc0 | (code >> 6);
          this.buffer[offset++] = 0x80 | (code & 0x3f);
          totalBytes += 2;
        } else if (code < 0xd8_00 || code >= 0xe0_00) {
          this.buffer[offset++] = 0xe0 | (code >> 12);
          this.buffer[offset++] = 0x80 | ((code >> 6) & 0x3f);
          this.buffer[offset++] = 0x80 | (code & 0x3f);
          totalBytes += 3;
        } else {
          // surrogate pair
          index++;
          const nextCode = value.charCodeAt(index);

          const surrogatePair =
            (((code & 0x3_ff) << 10) | (nextCode & 0x3_ff)) + 0x1_00_00;

          this.buffer[offset++] = 0xf0 | (surrogatePair >> 18);
          this.buffer[offset++] = 0x80 | ((surrogatePair >> 12) & 0x3f);
          this.buffer[offset++] = 0x80 | ((surrogatePair >> 6) & 0x3f);
          this.buffer[offset++] = 0x80 | (surrogatePair & 0x3f);
          totalBytes += 4;
        }

        if (totalBytes > 31) {
          fitInFixStr = false;
        } else if (totalBytes > 255) {
          fitInStr8 = false;
          break;
        }
      }

      if (fitInFixStr) {
        this.buffer[byteLengthoffset] = Symbols.FIXSTR_START | totalBytes;

        this.offset += totalBytes;

        return this;
      } else if (fitInStr8) {
        this.buffer[byteLengthoffset] = Symbols.STR8;

        const totalBytesPosition = byteLengthoffset + 1;

        this.buffer.copyWithin(
          totalBytesPosition + 1,
          totalBytesPosition,
          offset,
        );

        this.buffer[totalBytesPosition] = totalBytes;
        this.offset++;

        this.offset += totalBytes;
        return this;
      }
      // fallback
      this.offset = initialoffset;
    }

    if (this.sharedBuffer.byteLength < requiredSize) {
      this.sharedBuffer = this.bufferFactory(requiredSize);
    }

    const sharedBuffer = this.sharedBuffer;

    const byteLength = this.textEncoder.writeBytes(value, sharedBuffer);

    if (fitIn8Bits(byteLength)) {
      this.ensureCapacity(2 + byteLength);
      this.writeStr8Symbol(byteLength);
    } else if (fitIn16Bits(byteLength)) {
      this.ensureCapacity(3 + byteLength);
      this.writeStr16Symbol(byteLength);
    } else {
      this.ensureCapacity(5 + byteLength);
      this.writeStr32Symbol(byteLength);
    }

    this.writeBin(sharedBuffer.subarray(0, byteLength));

    return this;
  }

  writeNumber(value: number): this {
    if (Number.isInteger(value)) {
      if (value < 0) {
        // siged integers
        if (value > -33) {
          this.ensureCapacity(1);
          return this.writeNegativeFixInt(value);
        } else if (value > -129) {
          this.ensureCapacity(2);
          this.writeInt8Symbol();
          return this.writeInt8(value);
        } else if (value > -32_769) {
          this.ensureCapacity(3);
          this.writeInt16Symbol();
          return this.writeInt16(value);
        } else if (value > -2_147_483_649) {
          this.ensureCapacity(5);
          this.writeInt32Symbol();
          return this.writeInt32(value);
        } else if (value >= INT64_MIN) {
          this.ensureCapacity(9);
          this.writeInt64Symbol();
          return this.writeInt64(value);
        }

        throw new Error(
          `Integer too small to encode: ${value}. Consider using BigIntExtension.`,
        );
      } else {
        // unsiged integers
        if (fitIn7Bits(value)) {
          this.ensureCapacity(1);
          return this.writePositiveFixInt(value);
        }

        if (fitIn8Bits(value)) {
          this.ensureCapacity(2);
          this.writeUint8Symbol();
          return this.writeUint8(value);
        }

        if (fitIn16Bits(value)) {
          this.ensureCapacity(3);
          this.writeUint16Symbol();
          return this.writeUint16(value);
        }

        if (fitIn32Bits(value)) {
          this.ensureCapacity(5);
          this.writeUint32Symbol();
          return this.writeUint32(value);
        }

        if (value <= UINT64_MAX) {
          this.ensureCapacity(9);
          this.writeUint64Symbol();
          return this.writeUint64(value);
        }

        throw new Error(
          `Integer too large to encode: ${value}. Consider using BigIntExtension.`,
        );
      }
    } else if (this.forceFloat32) {
      this.ensureCapacity(5);
      this.writeFloat32Symbol();
      return this.writeFloat32(value);
    }

    this.ensureCapacity(9);
    this.writeFloat64Symbol();
    return this.writeFloat64(value);
  }

  openMap(keysLength: number): this {
    const requiredSize = keysLength * 4;

    if (keysLength < 16) {
      this.ensureCapacity(requiredSize + 1);
      this.writeFixMapSymbol(keysLength);
    } else if (fitIn16Bits(keysLength)) {
      this.ensureCapacity(requiredSize + 3);
      this.writeMap16Symbol(keysLength);
    } else if (fitIn32Bits(keysLength)) {
      this.ensureCapacity(requiredSize + 5);
      this.writeMap32Symbol(keysLength);
    } else {
      throw new Error(
        `Map size ${keysLength} exceeds maximum allowed size of ${UINT32_MAX}`,
      );
    }

    return this;
  }

  writeMap<TKey extends string | number, TValue>(
    value: Record<TKey, TValue>,
  ): this {
    const keys = Object.keys(value);

    if (this.sortKeys) {
      keys.sort();
    }

    const keysLength = keys.length;

    this.openMap(keysLength);

    for (const key of keys) {
      this.writeString(key);
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      this.write(value[key as TKey]);
    }

    return this;
  }

  openArray(length: number): this {
    const requiredSize = length * 4;

    if (length < 16) {
      this.ensureCapacity(requiredSize + 1);
      this.writeFixArraySymbol(length);
    } else if (fitIn16Bits(length)) {
      this.ensureCapacity(requiredSize + 3);
      this.writeArray16Symbol(length);
    } else if (fitIn32Bits(length)) {
      this.ensureCapacity(requiredSize + 5);
      this.writeArray32Symbol(length);
    } else {
      throw new Error(
        `Array size ${length} exceeds maximum allowed size of ${UINT32_MAX}`,
      );
    }

    return this;
  }

  writeArray(value: unknown[]): this {
    const length = value.length;

    this.openArray(length);

    for (let index = 0; index < length; ++index) {
      this.write(value[index]);
    }

    return this;
  }

  // writeBigInt(value: bigint): this {
  //   this.ensureCapacity(9);

  //   if (value < 0n) {
  //     this.writeInt64Symbol();
  //     return this.writeBigInt64(value);
  //   }

  //   this.writeUint64Symbol();
  //   return this.writeBigUint64(value);
  // }

  writeUint8Array(value: Uint8Array): this {
    if (fitIn8Bits(value.length)) {
      this.ensureCapacity(2 + value.length);
      this.writeBin8Symbol(value.length);
    } else if (fitIn16Bits(value.length)) {
      this.ensureCapacity(3 + value.length);
      this.writeBin16Symbol(value.length);
    } else if (fitIn32Bits(value.length)) {
      this.ensureCapacity(5 + value.length);
      this.writeBin32Symbol(value.length);
    } else {
      throw new Error(`Uint8Array too large to encode: ${value.length}`);
    }

    return this.writeBin(value);
  }

  writeExtension(
    extension: MessagePackExtension,
    encoder: ExtensionEncoder<TBuffer>,
  ): this {
    const writtenBytes = encoder.offset;

    if (writtenBytes === 1) {
      this.ensureCapacity(3);

      this.writeFixExt1Symbol(extension.type);
    } else if (writtenBytes === 2) {
      this.ensureCapacity(4);

      this.writeFixExt2Symbol(extension.type);
    } else if (writtenBytes === 4) {
      this.ensureCapacity(6);

      this.writeFixExt4Symbol(extension.type);
    } else if (writtenBytes === 8) {
      this.ensureCapacity(10);

      this.writeFixExt8Symbol(extension.type);
    } else if (writtenBytes === 16) {
      this.ensureCapacity(18);

      this.writeFixExt16Symbol(extension.type);
    } else if (fitIn8Bits(writtenBytes)) {
      this.ensureCapacity(3 + writtenBytes);

      this.writeExt8Symbol(extension.type, writtenBytes);
    } else if (fitIn16Bits(writtenBytes)) {
      this.ensureCapacity(4 + writtenBytes);

      this.writeExt16Symbol(extension.type, writtenBytes);
    } else if (fitIn32Bits(writtenBytes)) {
      this.ensureCapacity(6 + writtenBytes);

      this.writeExt32Symbol(extension.type, writtenBytes);
    } else {
      throw new Error(
        `Extension data too large to encode: ${writtenBytes} bytes`,
      );
    }

    this.buffer.set(encoder.buffer.subarray(0, writtenBytes), this.offset);

    this.offset += writtenBytes;

    return this;
  }

  tryToWriteExtensionValue(value: object | bigint): number {
    if (this.extensions.size > 0) {
      const iterator = this.extensions.values();
      const extensionEncoder = this.getExtensionEncoder();

      for (const extension of iterator) {
        extensionEncoder.resetBuffer();

        extension.encode(value, extensionEncoder);

        if (extensionEncoder.offset > 0) {
          this.writeExtension(extension, extensionEncoder);

          return extensionEncoder.offset;
        }
      }
    }

    return 0;
  }

  writeBigInt(value: bigint): this {
    const writtenBytes = this.tryToWriteExtensionValue(value);

    if (writtenBytes > 0) {
      return this;
    }

    throw new TypeError(
      '"bigint" encoding is not supported by default. Consider using BigIntExtension',
    );
  }

  writeObject(value: object): this {
    if (Array.isArray(value)) {
      return this.writeArray(value);
    }

    const writtenBytes = this.tryToWriteExtensionValue(value);

    if (writtenBytes > 0) {
      return this;
    }

    if (value instanceof Uint8Array) {
      return this.writeUint8Array(value);
    }

    return this.writeMap(value);
  }

  write(value: unknown): this {
    // oxlint-disable-next-line typescript/switch-exhaustiveness-check
    switch (typeof value) {
      case 'number': {
        return this.writeNumber(value);
      }
      case 'string': {
        return this.writeString(value);
      }
      case 'boolean': {
        this.ensureCapacity(1);

        if (value) {
          return this.writeTrueSymbol();
        }

        return this.writeFalseSymbol();
      }
      case 'undefined': {
        this.ensureCapacity(1);
        return this.writeNilSymbol();
      }
      case 'bigint': {
        return this.writeBigInt(value);
      }
      case 'object': {
        if (value === null) {
          this.ensureCapacity(1);
          return this.writeNilSymbol();
        }

        return this.writeObject(value);
      }
      default: {
        throw new TypeError(
          `Unsupported type for encoding: ${typeof value}. Consider using an extension.`,
        );
      }
    }
  }
}

export default Encoder;
