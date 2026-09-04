// oxlint-disable unicorn/prefer-code-point
import { describe, expect, it, vi } from 'vitest';

import {
  DEFAULT_ALLOCATION_SIZE,
  INT64_MIN,
  UINT64_MAX,
} from '../../../src/constants.ts';
import Encoder from '../../../src/encoder/encoder.ts';
import DefaultTextEncoder from '../../../src/encoder/textEncoders/defaultTextEncoder.ts';
import type MessagePackExtension from '../../../src/extensions/interfaces/messagePackExtension.ts';
import Symbols from '../../../src/symbols.ts';

describe('internal properties', () => {
  class EncoderMock extends Encoder {
    public getSharedBuffer(): Uint8Array {
      return this.sharedBuffer;
    }

    public getSortKeys(): boolean {
      return this.sortKeys;
    }
  }

  it('default options', () => {
    const encoder = new EncoderMock();

    expect(encoder.buffer).toHaveLength(DEFAULT_ALLOCATION_SIZE);
    expect(encoder.textEncoder).toBeInstanceOf(DefaultTextEncoder);
    expect(encoder.offset).toBe(0);
    expect(encoder.getSortKeys()).toBe(false);
    expect(encoder.getSharedBuffer()).toHaveLength(DEFAULT_ALLOCATION_SIZE);
  });

  it('getExtensionEncoder', () => {
    const encoder = new EncoderMock();

    const extensionBuffer = encoder.getExtensionEncoder();

    expect(extensionBuffer).not.toBe(encoder);
    expect(extensionBuffer.buffer).not.toBe(encoder.buffer);
    expect(extensionBuffer.textEncoder).toBe(encoder.textEncoder);
  });

  it('resizeBuffer', () => {
    const encoder = new EncoderMock({
      initialBufferSize: 1,
    });

    expect(encoder.buffer).toHaveLength(1);

    encoder.resizeBuffer(2);

    expect(encoder.buffer).toHaveLength(2);
  });

  it('ensureCapacity', () => {
    const encoder = new EncoderMock({
      initialBufferSize: 1,
    });

    expect(encoder.buffer).toHaveLength(1);

    encoder.ensureCapacity(2);

    expect(encoder.buffer).toHaveLength(4);
  });

  it('resetBuffer', () => {
    const encoder = new EncoderMock();

    expect(encoder.offset).toBe(0);

    encoder.writeUint8(1);

    expect(encoder.offset).toBe(1);

    encoder.resetBuffer();

    expect(encoder.offset).toBe(0);
  });
});

describe('write primitive types', () => {
  it('writePositiveFixInt', () => {
    const encoder = new Encoder({
      initialBufferSize: 1,
    });

    encoder.writePositiveFixInt(42);

    expect(encoder.buffer).toBeBytes([42]);
    expect(encoder.offset).toBe(1);
  });

  it('writeNegativeFixInt', () => {
    const encoder = new Encoder({
      initialBufferSize: 1,
    });

    encoder.writeNegativeFixInt(-1);

    expect(encoder.buffer).toBeBytes([255]);
    expect(encoder.offset).toBe(1);
  });

  it('writeBin', () => {
    const encoder = new Encoder({
      initialBufferSize: 3,
    });

    expect(encoder.buffer).not.toBeBytes([1, 2, 3]);

    encoder.writeBin(new Uint8Array([1, 2, 3]));

    expect(encoder.buffer).toBeBytes([1, 2, 3]);
    expect(encoder.offset).toBe(3);
  });

  it('writeFloat32', () => {
    const encoder = new Encoder({
      initialBufferSize: 4,
    });

    encoder.writeFloat32(1.5);

    expect(encoder.buffer).toBeBytes([63, 192, 0, 0]);
    expect(encoder.offset).toBe(4);
  });

  it('writeFloat64', () => {
    const encoder = new Encoder({
      initialBufferSize: 8,
    });

    encoder.writeFloat64(1.5);

    expect(encoder.buffer).toBeBytes([63, 248, 0, 0, 0, 0, 0, 0]);
    expect(encoder.offset).toBe(8);
  });

  it('writeUint8', () => {
    const encoder = new Encoder({
      initialBufferSize: 1,
    });

    encoder.writeUint8(128);

    expect(encoder.buffer).toBeBytes([128]);
    expect(encoder.offset).toBe(1);
  });

  it('writeUint16', () => {
    const encoder = new Encoder({
      initialBufferSize: 2,
    });

    encoder.writeUint16(256);

    expect(encoder.buffer).toBeBytes([1, 0]);
    expect(encoder.offset).toBe(2);
  });

  it('writeUint32', () => {
    const encoder = new Encoder({
      initialBufferSize: 4,
    });

    encoder.writeUint32(65_536);

    expect(encoder.buffer).toBeBytes([0, 1, 0, 0]);
    expect(encoder.offset).toBe(4);
  });

  it('writeUint64', () => {
    const encoder = new Encoder({
      initialBufferSize: 8,
    });

    /**
     * See {@link UINT64_MAX} for more information on the maximum value of a
     * uint64 in JavaScript.
     */
    encoder.writeUint64(UINT64_MAX);

    expect(encoder.buffer).toBeBytes([0, 31, 255, 255, 255, 255, 255, 255]);
    expect(encoder.offset).toBe(8);
  });

  it('writeInt8', () => {
    const encoder = new Encoder({
      initialBufferSize: 1,
    });

    encoder.writeInt8(-33);

    expect(encoder.buffer).toBeBytes([223]);
    expect(encoder.offset).toBe(1);
  });

  it('writeInt16', () => {
    const encoder = new Encoder({
      initialBufferSize: 2,
    });

    encoder.writeInt16(-129);

    expect(encoder.buffer).toBeBytes([255, 127]);
    expect(encoder.offset).toBe(2);
  });

  it('writeInt32', () => {
    const encoder = new Encoder({
      initialBufferSize: 4,
    });

    encoder.writeInt32(-32_769);

    expect(encoder.buffer).toBeBytes([255, 255, 127, 255]);
    expect(encoder.offset).toBe(4);
  });

  it('writeInt64', () => {
    const encoder = new Encoder({
      initialBufferSize: 8,
    });

    /**
     * See {@link INT64_MIN} for more information on the minimum value of a
     * int64 in JavaScript.
     */
    encoder.writeInt64(INT64_MIN);

    expect(encoder.buffer).toBeBytes([255, 224, 0, 0, 0, 0, 0, 1]);
    expect(encoder.offset).toBe(8);
  });

  it('writeStr', () => {
    const encoder = new Encoder({
      initialBufferSize: 3,
    });

    encoder.writeStr('foo');

    expect(encoder.buffer).toBeBytes([102, 111, 111]);
    expect(encoder.offset).toBe(3);
  });
});

describe('write symbols', () => {
  it('writeNilSymbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 1,
    });

    encoder.writeNilSymbol();

    expect(encoder.buffer).toBeBytes([Symbols.NIL]);
    expect(encoder.offset).toBe(1);
  });

  it('writeFalseSymbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 1,
    });

    encoder.writeFalseSymbol();

    expect(encoder.buffer).toBeBytes([Symbols.FALSE]);
    expect(encoder.offset).toBe(1);
  });

  it('writeTrueSymbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 1,
    });

    encoder.writeTrueSymbol();

    expect(encoder.buffer).toBeBytes([Symbols.TRUE]);
    expect(encoder.offset).toBe(1);
  });

  it('writeFixMapSymbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 1,
    });

    encoder.writeFixMapSymbol(3);

    expect(encoder.buffer).toBeBytes([Symbols.FIXMAP_START | 3]);
    expect(encoder.offset).toBe(1);
  });

  it('writeFixArraySymbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 1,
    });

    encoder.writeFixArraySymbol(3);

    expect(encoder.buffer).toBeBytes([Symbols.FIXARRAY_START | 3]);
    expect(encoder.offset).toBe(1);
  });

  it('writeFixStrSymbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 1,
    });

    encoder.writeFixStrSymbol(3);

    expect(encoder.buffer).toBeBytes([Symbols.FIXSTR_START | 3]);
    expect(encoder.offset).toBe(1);
  });

  it('writeBin8Symbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 2,
    });

    encoder.writeBin8Symbol(3);

    expect(encoder.buffer).toBeBytes([Symbols.BIN8, 3]);
    expect(encoder.offset).toBe(2);
  });

  it('writeBin16Symbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 3,
    });

    encoder.writeBin16Symbol(3);

    expect(encoder.buffer).toBeBytes([Symbols.BIN16, 0, 3]);
    expect(encoder.offset).toBe(3);
  });

  it('writeBin32Symbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 5,
    });

    encoder.writeBin32Symbol(3);

    expect(encoder.buffer).toBeBytes([Symbols.BIN32, 0, 0, 0, 3]);
    expect(encoder.offset).toBe(5);
  });

  it('writeFloat32Symbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 1,
    });

    encoder.writeFloat32Symbol();

    expect(encoder.buffer).toBeBytes([Symbols.FLOAT32]);
    expect(encoder.offset).toBe(1);
  });

  it('writeFloat64Symbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 1,
    });

    encoder.writeFloat64Symbol();

    expect(encoder.buffer).toBeBytes([Symbols.FLOAT64]);
    expect(encoder.offset).toBe(1);
  });

  it('writeUint8Symbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 1,
    });

    encoder.writeUint8Symbol();

    expect(encoder.buffer).toBeBytes([Symbols.UINT8]);
    expect(encoder.offset).toBe(1);
  });

  it('writeUint16Symbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 1,
    });

    encoder.writeUint16Symbol();

    expect(encoder.buffer).toBeBytes([Symbols.UINT16]);
    expect(encoder.offset).toBe(1);
  });

  it('writeUint32Symbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 1,
    });

    encoder.writeUint32Symbol();

    expect(encoder.buffer).toBeBytes([Symbols.UINT32]);
    expect(encoder.offset).toBe(1);
  });

  it('writeUint64Symbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 1,
    });

    encoder.writeUint64Symbol();

    expect(encoder.buffer).toBeBytes([Symbols.UINT64]);
    expect(encoder.offset).toBe(1);
  });

  it('writeInt8Symbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 1,
    });

    encoder.writeInt8Symbol();

    expect(encoder.buffer).toBeBytes([Symbols.INT8]);
    expect(encoder.offset).toBe(1);
  });

  it('writeInt16Symbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 1,
    });

    encoder.writeInt16Symbol();

    expect(encoder.buffer).toBeBytes([Symbols.INT16]);
    expect(encoder.offset).toBe(1);
  });

  it('writeInt32Symbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 1,
    });

    encoder.writeInt32Symbol();

    expect(encoder.buffer).toBeBytes([Symbols.INT32]);
    expect(encoder.offset).toBe(1);
  });

  it('writeInt64Symbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 1,
    });

    encoder.writeInt64Symbol();

    expect(encoder.buffer).toBeBytes([Symbols.INT64]);
    expect(encoder.offset).toBe(1);
  });

  it('writeStr8Symbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 2,
    });

    encoder.writeStr8Symbol(3);

    expect(encoder.buffer).toBeBytes([Symbols.STR8, 3]);
    expect(encoder.offset).toBe(2);
  });

  it('writeStr16Symbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 3,
    });

    encoder.writeStr16Symbol(4);

    expect(encoder.buffer).toBeBytes([Symbols.STR16, 0, 4]);
    expect(encoder.offset).toBe(3);
  });

  it('writeStr32Symbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 5,
    });

    encoder.writeStr32Symbol(4);

    expect(encoder.buffer).toBeBytes([Symbols.STR32, 0, 0, 0, 4]);
    expect(encoder.offset).toBe(5);
  });

  it('writeArray16Symbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 3,
    });

    encoder.writeArray16Symbol(4);

    expect(encoder.buffer).toBeBytes([Symbols.ARRAY16, 0, 4]);
    expect(encoder.offset).toBe(3);
  });

  it('writeArray32Symbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 5,
    });

    encoder.writeArray32Symbol(4);

    expect(encoder.buffer).toBeBytes([Symbols.ARRAY32, 0, 0, 0, 4]);
    expect(encoder.offset).toBe(5);
  });

  it('writeMap16Symbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 3,
    });

    encoder.writeMap16Symbol(4);

    expect(encoder.buffer).toBeBytes([Symbols.MAP16, 0, 4]);
    expect(encoder.offset).toBe(3);
  });

  it('writeMap32Symbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 5,
    });

    encoder.writeMap32Symbol(4);

    expect(encoder.buffer).toBeBytes([Symbols.MAP32, 0, 0, 0, 4]);
    expect(encoder.offset).toBe(5);
  });

  it('writeFixExt1Symbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 2,
    });

    encoder.writeFixExt1Symbol(1);

    expect(encoder.buffer).toBeBytes([Symbols.FIXEXT1, 1]);
    expect(encoder.offset).toBe(2);
  });

  it('writeFixExt2Symbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 2,
    });

    encoder.writeFixExt2Symbol(1);

    expect(encoder.buffer).toBeBytes([Symbols.FIXEXT2, 1]);
    expect(encoder.offset).toBe(2);
  });

  it('writeFixExt4Symbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 2,
    });

    encoder.writeFixExt4Symbol(1);

    expect(encoder.buffer).toBeBytes([Symbols.FIXEXT4, 1]);
    expect(encoder.offset).toBe(2);
  });

  it('writeFixExt8Symbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 2,
    });

    encoder.writeFixExt8Symbol(1);

    expect(encoder.buffer).toBeBytes([Symbols.FIXEXT8, 1]);
    expect(encoder.offset).toBe(2);
  });

  it('writeFixExt16Symbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 2,
    });

    encoder.writeFixExt16Symbol(1);

    expect(encoder.buffer).toBeBytes([Symbols.FIXEXT16, 1]);
    expect(encoder.offset).toBe(2);
  });

  it('writeExt8Symbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 3,
    });

    encoder.writeExt8Symbol(1, 2);

    expect(encoder.buffer).toBeBytes([Symbols.EXT8, 2, 1]);
    expect(encoder.offset).toBe(3);
  });

  it('writeExt16Symbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 4,
    });

    encoder.writeExt16Symbol(1, 2);

    expect(encoder.buffer).toBeBytes([Symbols.EXT16, 0, 2, 1]);
    expect(encoder.offset).toBe(4);
  });

  it('writeExt32Symbol', () => {
    const encoder = new Encoder({
      initialBufferSize: 6,
    });

    encoder.writeExt32Symbol(1, 2);

    expect(encoder.buffer).toBeBytes([Symbols.EXT32, 0, 0, 0, 2, 1]);
    expect(encoder.offset).toBe(6);
  });
});

describe('general writing', () => {
  describe('writeString', () => {
    it('should write a fix str', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      encoder.writeString('a'.repeat(31));

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.FIXSTR_START | 31,
        ...new Array<number>(31).fill(97),
      ]);
    });

    it('should write a str8', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      encoder.writeString('a'.repeat(32));

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.STR8,
        32,
        ...new Array<number>(32).fill(97),
      ]);
    });

    it('should write a str8 with a multi-byte character', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      encoder.writeString('á'.repeat(32));

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.STR8,
        64,
        // oxlint-disable-next-line unicorn/no-array-fill-with-reference-type
        ...new Array<number[]>(32).fill([195, 161]).flat(),
      ]);
    });

    it('should write a str8 bypassing the threshold', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      encoder.writeString('a'.repeat(51));

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.STR8,
        51,
        ...new Array<number>(51).fill(97),
      ]);
    });

    it('should write a str16', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      encoder.writeString('á'.repeat(256));

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.STR16,
        2,
        0,
        // oxlint-disable-next-line unicorn/no-array-fill-with-reference-type
        ...new Array<number[]>(256).fill([195, 161]).flat(),
      ]);
    });

    it('should write a str32', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      encoder.writeString('á'.repeat(65_536));

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.STR32,
        0,
        2,
        0,
        0,
        // oxlint-disable-next-line unicorn/no-array-fill-with-reference-type
        ...new Array<number[]>(65_536).fill([195, 161]).flat(),
      ]);
    });
  });

  describe('writeSignedInteger', () => {
    it('should encode a negative fix int', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      encoder.writeSignedInteger(-10);

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.NEGATIVE_FIXINT_START | (-10 + 32),
      ]);
    });

    it('should encode a int 8', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      encoder.writeSignedInteger(-128);

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.INT8,
        128,
      ]);
    });

    it('should encode a int 16', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      encoder.writeSignedInteger(-32_768);

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.INT16,
        128,
        0,
      ]);
    });

    it('should encode a int 32', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      encoder.writeSignedInteger(-2_147_483_648);

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.INT32,
        128,
        0,
        0,
        0,
      ]);
    });

    it('should encode a int 64', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      encoder.writeSignedInteger(-2_147_483_649);

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.INT64,
        255,
        255,
        255,
        255,
        127,
        255,
        255,
        255,
      ]);
    });
  });

  describe('writeUnsignedInteger', () => {
    it('should encode a positive fix int', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      encoder.writeUnsignedInteger(127);

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([127]);
    });

    it('should encode a uint 8', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      encoder.writeUnsignedInteger(255);

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.UINT8,
        255,
      ]);
    });

    it('should encode a uint 16', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      encoder.writeUnsignedInteger(65_535);

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.UINT16,
        255,
        255,
      ]);
    });

    it('should encode a uint 32', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      encoder.writeUnsignedInteger(4_294_967_295);

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.UINT32,
        255,
        255,
        255,
        255,
      ]);
    });

    it('should encode a uint 64', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      encoder.writeUnsignedInteger(Number.MAX_SAFE_INTEGER);

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.UINT64,
        0,
        31,
        255,
        255,
        255,
        255,
        255,
        255,
      ]);
    });
  });

  describe('writeFloat', () => {
    it('should encode a float 32', () => {
      const encoder = new Encoder({
        forceFloat32: true,
        initialBufferSize: 1,
      });

      encoder.writeFloat(12_345.15625);

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.FLOAT32,
        70,
        64,
        228,
        160,
      ]);
    });

    it('should encode a float 64', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      encoder.writeFloat(1.1);

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.FLOAT64,
        63,
        241,
        153,
        153,
        153,
        153,
        153,
        154,
      ]);
    });
  });

  describe('writeNumber', () => {
    it('check that calls writeSignedInteger', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const writeSignedIntegerSpy = vi.spyOn(encoder, 'writeSignedInteger');

      encoder.writeNumber(-1);

      expect(writeSignedIntegerSpy).toHaveBeenCalledWith(-1);
    });

    it('check that calls writeUnsignedInteger', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const writeUnsignedIntegerSpy = vi.spyOn(encoder, 'writeUnsignedInteger');

      encoder.writeNumber(1);

      expect(writeUnsignedIntegerSpy).toHaveBeenCalledWith(1);
    });

    it('check that calls writeFloat', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const writeFloatSpy = vi.spyOn(encoder, 'writeFloat');

      encoder.writeNumber(1.1);

      expect(writeFloatSpy).toHaveBeenCalledWith(1.1);
    });
  });

  describe('writeBigInt', () => {
    describe('writes a bigint as fixext8', () => {
      it('write 0n', () => {
        const encoder = new Encoder({
          bigIntExtension: {
            enabled: true,
            type: 123,
          },
          initialBufferSize: 1,
        });

        encoder.writeBigInt(0n);

        expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
          Symbols.FIXEXT8,
          123,
          ...new Array(8).fill(0),
        ]);
      });

      it('write a positive bigint', () => {
        const encoder = new Encoder({
          bigIntExtension: {
            enabled: true,
            type: 123,
          },
          initialBufferSize: 1,
        });
        encoder.writeBigInt(1n);

        expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
          Symbols.FIXEXT8,
          123,
          ...new Array(7).fill(0),
          2,
        ]);
      });

      it('write a negative bigint', () => {
        const encoder = new Encoder({
          bigIntExtension: {
            enabled: true,
            type: 123,
          },
          initialBufferSize: 1,
        });

        encoder.writeBigInt(-1n);

        expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
          Symbols.FIXEXT8,
          123,
          ...new Array(7).fill(0),
          1,
        ]);
      });
    });

    describe('writes a bigint as fixext16', () => {
      it('write a positive bigint', () => {
        const encoder = new Encoder({
          bigIntExtension: {
            enabled: true,
            type: 123,
          },
          initialBufferSize: 1,
        });

        const value = 1n << 63n;

        encoder.writeBigInt(value);

        expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
          Symbols.FIXEXT16,
          123,
          ...new Array(15).fill(0),
          1,
        ]);
      });

      it('write a negative bigint', () => {
        const encoder = new Encoder({
          bigIntExtension: {
            enabled: true,
            type: 123,
          },
          initialBufferSize: 1,
        });

        const value = -(1n << 63n) - 1n;

        encoder.writeBigInt(value);

        expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
          Symbols.FIXEXT16,
          123,
          ...new Array(7).fill(0),
          1,
          ...new Array(7).fill(0),
          1,
        ]);
      });
    });

    describe('writes a bigint as ext8', () => {
      it('write a positive bigint', () => {
        const encoder = new Encoder({
          bigIntExtension: {
            enabled: true,
            type: 123,
          },
          initialBufferSize: 1,
        });

        const value = 1n << 127n;

        encoder.writeBigInt(value);

        expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
          Symbols.EXT8,
          24,
          123,
          ...new Array(23).fill(0),
          1,
        ]);
      });

      it('write a negative bigint', () => {
        const encoder = new Encoder({
          bigIntExtension: {
            enabled: true,
            type: 123,
          },
          initialBufferSize: 1,
        });

        const value = -(1n << 127n) - 1n;

        encoder.writeBigInt(value);

        expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
          Symbols.EXT8,
          24,
          123,
          ...new Array(7).fill(0),
          1,
          ...new Array(15).fill(0),
          1,
        ]);
      });
    });

    describe('write a bigint as ext16', () => {
      it('write a positive bigint', () => {
        const encoder = new Encoder({
          bigIntExtension: {
            enabled: true,
            type: 123,
          },
          initialBufferSize: 1,
        });

        const value = 1n << 1983n;

        encoder.writeBigInt(value);

        expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
          Symbols.EXT16,
          1,
          0,
          123,
          ...new Array(255).fill(0),
          1,
        ]);
      });

      it('write a negative bigint', () => {
        const encoder = new Encoder({
          bigIntExtension: {
            enabled: true,
            type: 123,
          },
          initialBufferSize: 1,
        });

        const value = -(1n << 1983n) - 1n;

        encoder.writeBigInt(value);

        expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
          Symbols.EXT16,
          1,
          0,
          123,
          ...new Array(7).fill(0),
          1,
          ...new Array(247).fill(0),
          1,
        ]);
      });
    });

    describe('write a bigint as ext32', () => {
      it('write a positive bigint', () => {
        const encoder = new Encoder({
          bigIntExtension: {
            enabled: true,
            type: 123,
          },
          initialBufferSize: 1,
        });

        const value = 1n << 524_223n;

        encoder.writeBigInt(value);

        expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
          Symbols.EXT32,
          0,
          1,
          0,
          0,
          123,
          ...new Array(65_535).fill(0),
          1,
        ]);
      });

      it('write a negative bigint', () => {
        const encoder = new Encoder({
          bigIntExtension: {
            enabled: true,
            type: 123,
          },
          initialBufferSize: 1,
        });

        const value = -(1n << 524_223n) - 1n;

        encoder.writeBigInt(value);

        expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
          Symbols.EXT32,
          0,
          1,
          0,
          0,
          123,
          ...new Array(7).fill(0),
          1,
          ...new Array(65_527).fill(0),
          1,
        ]);
      });
    });
  });

  describe('writeMap', () => {
    describe('openMap', () => {
      it('should open a fixmap', () => {
        const encoder = new Encoder({
          initialBufferSize: 1,
        });

        encoder.openMap(15);

        expect(encoder.flush()).toBeBytes([Symbols.FIXMAP_START | 15]);
      });

      it('should open a map16', () => {
        const encoder = new Encoder({
          initialBufferSize: 1,
        });

        encoder.openMap(65_535);

        expect(encoder.flush()).toBeBytes([Symbols.MAP16, 255, 255]);
      });

      it('should open a map32', () => {
        const encoder = new Encoder({
          initialBufferSize: 1,
        });

        encoder.openMap(65_536);

        expect(encoder.flush()).toBeBytes([Symbols.MAP32, 0, 1, 0, 0]);
      });

      it('should throw an error if the map is too big', () => {
        const encoder = new Encoder({
          initialBufferSize: 1,
        });

        expect(() => encoder.openMap(4_294_967_296)).toThrow(
          'Map size 4294967296 exceeds maximum allowed size of 4294967295',
        );
      });
    });

    it('should write a fix map', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      // oxlint-disable id-length
      const object = {
        a: 0,
        b: 0,
        c: 0,
        d: 0,
        e: 0,
        f: 0,
        g: 0,
        h: 0,
        i: 0,
        j: 0,
        k: 0,
        l: 0,
        m: 0,
        n: 0,
        o: 0,
      };
      // oxlint-enable id-length

      encoder.writeMap(object);

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.FIXMAP_START | 15,
        Symbols.FIXSTR_START | 1,
        97,
        0,
        Symbols.FIXSTR_START | 1,
        98,
        0,
        Symbols.FIXSTR_START | 1,
        99,
        0,
        Symbols.FIXSTR_START | 1,
        100,
        0,
        Symbols.FIXSTR_START | 1,
        101,
        0,
        Symbols.FIXSTR_START | 1,
        102,
        0,
        Symbols.FIXSTR_START | 1,
        103,
        0,
        Symbols.FIXSTR_START | 1,
        104,
        0,
        Symbols.FIXSTR_START | 1,
        105,
        0,
        Symbols.FIXSTR_START | 1,
        106,
        0,
        Symbols.FIXSTR_START | 1,
        107,
        0,
        Symbols.FIXSTR_START | 1,
        108,
        0,
        Symbols.FIXSTR_START | 1,
        109,
        0,
        Symbols.FIXSTR_START | 1,
        110,
        0,
        Symbols.FIXSTR_START | 1,
        111,
        0,
      ]);
    });

    it('should write a map 16', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      // oxlint-disable id-length
      const object = {
        a: 0,
        b: 0,
        c: 0,
        d: 0,
        e: 0,
        f: 0,
        g: 0,
        h: 0,
        i: 0,
        j: 0,
        k: 0,
        l: 0,
        m: 0,
        n: 0,
        o: 0,
        p: 0,
      };
      // oxlint-enable id-length

      encoder.writeMap(object);

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.MAP16,
        0,
        16,
        Symbols.FIXSTR_START | 1,
        97,
        0,
        Symbols.FIXSTR_START | 1,
        98,
        0,
        Symbols.FIXSTR_START | 1,
        99,
        0,
        Symbols.FIXSTR_START | 1,
        100,
        0,
        Symbols.FIXSTR_START | 1,
        101,
        0,
        Symbols.FIXSTR_START | 1,
        102,
        0,
        Symbols.FIXSTR_START | 1,
        103,
        0,
        Symbols.FIXSTR_START | 1,
        104,
        0,
        Symbols.FIXSTR_START | 1,
        105,
        0,
        Symbols.FIXSTR_START | 1,
        106,
        0,
        Symbols.FIXSTR_START | 1,
        107,
        0,
        Symbols.FIXSTR_START | 1,
        108,
        0,
        Symbols.FIXSTR_START | 1,
        109,
        0,
        Symbols.FIXSTR_START | 1,
        110,
        0,
        Symbols.FIXSTR_START | 1,
        111,
        0,
        Symbols.FIXSTR_START | 1,
        112,
        0,
      ]);
    });

    it('should write a map 32', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const object: Record<string, number> = {};
      const expected: number[] = [Symbols.MAP32, 0, 1, 0, 0];

      for (let index = 0; index < 65_536; index++) {
        const key = `k${index}`;

        object[key] = 0;
        expected.push(Symbols.FIXSTR_START | key.length);

        for (const character of key) {
          expected.push(character.charCodeAt(0));
        }

        expected.push(0);
      }

      encoder.writeMap(object);

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes(expected);
    });
  });

  describe('writeArray', () => {
    describe('openArray', () => {
      it('should open a fixarray', () => {
        const encoder = new Encoder({
          initialBufferSize: 1,
        });

        encoder.openArray(15);

        expect(encoder.flush()).toBeBytes([Symbols.FIXARRAY_START | 15]);
      });

      it('should open an array16', () => {
        const encoder = new Encoder({
          initialBufferSize: 1,
        });

        encoder.openArray(65_535);

        expect(encoder.flush()).toBeBytes([Symbols.ARRAY16, 255, 255]);
      });

      it('should open an array32', () => {
        const encoder = new Encoder({
          initialBufferSize: 1,
        });

        encoder.openArray(65_536);

        expect(encoder.flush()).toBeBytes([Symbols.ARRAY32, 0, 1, 0, 0]);
      });

      it('should throw an error if the array is too big', () => {
        const encoder = new Encoder({
          initialBufferSize: 1,
        });

        expect(() => encoder.openArray(4_294_967_296)).toThrow(
          'Array size 4294967296 exceeds maximum allowed size of 4294967295',
        );
      });
    });

    it('should write a fix array', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const array = new Array(15).fill(0);

      encoder.writeArray(array);

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.FIXARRAY_START | 15,
        ...new Array<number>(15).fill(0),
      ]);
    });

    it('should write an array 16', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const array = new Array(16).fill(0);

      encoder.writeArray(array);

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.ARRAY16,
        0,
        16,
        ...new Array<number>(16).fill(0),
      ]);
    });

    it('should write an array 32', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const array = new Array(65_536).fill(0);

      encoder.writeArray(array);

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.ARRAY32,
        0,
        1,
        0,
        0,
        ...new Array<number>(65_536).fill(0),
      ]);
    });
  });

  describe('writeUint8Array', () => {
    it('should write a bin 8', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const array = new Uint8Array([1, 2, 3]);

      encoder.writeUint8Array(array);

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.BIN8,
        3,
        1,
        2,
        3,
      ]);
    });

    it('should write a bin 16', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const array = new Uint8Array(256);

      encoder.writeUint8Array(array);

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.BIN16,
        1,
        0,
        ...new Array<number>(256).fill(0),
      ]);
    });

    it('should write a bin 32', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const array = new Uint8Array(65_536);

      encoder.writeUint8Array(array);

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.BIN32,
        0,
        1,
        0,
        0,
        ...new Array<number>(65_536).fill(0),
      ]);
    });

    it('should throw an error if the uint8 array is too big', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      // const array = {
      //   length: 4_294_967_296,
      // } as unknown as Uint8Array;
      const array = new Uint8Array(4_294_967_296);

      expect(() => encoder.writeUint8Array(array)).toThrow(
        'Uint8Array too large to encode: 4294967296',
      );
    });
  });

  describe('writeExtension', () => {
    it('should encode a fixext 1', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const extensionBuffer = new Encoder({
        initialBufferSize: 1,
      });

      extensionBuffer.writeUint8(42);

      const extension: MessagePackExtension = {
        decode: vi.fn<() => void>(),
        encode: vi.fn<() => void>(),
        type: 1,
      };

      encoder.writeExtension(extension, extensionBuffer);

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.FIXEXT1,
        1,
        42,
      ]);
    });

    it('should encode a fixext 2', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const extensionBuffer = new Encoder({
        initialBufferSize: 2,
      });

      extensionBuffer.writeBin(new Uint8Array(2).fill(42));

      const extension: MessagePackExtension = {
        decode: vi.fn<() => void>(),
        encode: vi.fn<() => void>(),
        type: 1,
      };

      encoder.writeExtension(extension, extensionBuffer);

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.FIXEXT2,
        1,
        ...new Array<number>(2).fill(42),
      ]);
    });

    it('should encode a fixext 4', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const extensionBuffer = new Encoder({
        initialBufferSize: 4,
      });

      extensionBuffer.writeBin(new Uint8Array(4).fill(42));

      const extension: MessagePackExtension = {
        decode: vi.fn<() => void>(),
        encode: vi.fn<() => void>(),
        type: 1,
      };

      encoder.writeExtension(extension, extensionBuffer);

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.FIXEXT4,
        1,
        ...new Array<number>(4).fill(42),
      ]);
    });

    it('should encode a fixext 8', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const extensionBuffer = new Encoder({
        initialBufferSize: 8,
      });

      extensionBuffer.writeBin(new Uint8Array(8).fill(42));

      const extension: MessagePackExtension = {
        decode: vi.fn<() => void>(),
        encode: vi.fn<() => void>(),
        type: 1,
      };

      encoder.writeExtension(extension, extensionBuffer);

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.FIXEXT8,
        1,
        ...new Array<number>(8).fill(42),
      ]);
    });

    it('should encode a fixext 16', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const extensionBuffer = new Encoder({
        initialBufferSize: 16,
      });

      extensionBuffer.writeBin(new Uint8Array(16).fill(42));

      const extension: MessagePackExtension = {
        decode: vi.fn<() => void>(),
        encode: vi.fn<() => void>(),
        type: 1,
      };

      encoder.writeExtension(extension, extensionBuffer);

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.FIXEXT16,
        1,
        ...new Array<number>(16).fill(42),
      ]);
    });

    it('should encode a ext 8', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const extensionBuffer = new Encoder({
        initialBufferSize: 3,
      });

      extensionBuffer.writeBin(new Uint8Array(3).fill(42));

      const extension: MessagePackExtension = {
        decode: vi.fn<() => void>(),
        encode: vi.fn<() => void>(),
        type: 1,
      };

      encoder.writeExtension(extension, extensionBuffer);

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.EXT8,
        3,
        1,
        ...new Array<number>(3).fill(42),
      ]);
    });

    it('should encode a ext 16', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const extensionBuffer = new Encoder({
        initialBufferSize: 256,
      });

      extensionBuffer.writeBin(new Uint8Array(256).fill(42));

      const extension: MessagePackExtension = {
        decode: vi.fn<() => void>(),
        encode: vi.fn<() => void>(),
        type: 1,
      };

      encoder.writeExtension(extension, extensionBuffer);

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.EXT16,
        1,
        0,
        1,
        ...new Array<number>(256).fill(42),
      ]);
    });

    it('should encode a ext 32', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const extensionBuffer = new Encoder({
        initialBufferSize: 65_536,
      });

      extensionBuffer.writeBin(new Uint8Array(65_536).fill(42));

      const extension: MessagePackExtension = {
        decode: vi.fn<() => void>(),
        encode: vi.fn<() => void>(),
        type: 1,
      };

      encoder.writeExtension(extension, extensionBuffer);

      expect(encoder.buffer.slice(0, encoder.offset)).toBeBytes([
        Symbols.EXT32,
        0,
        1,
        0,
        0,
        1,
        ...new Array<number>(65_536).fill(42),
      ]);
    });

    it('should throw an error if the extension is too big', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const extensionBuffer = new Encoder({
        initialBufferSize: 1,
      });

      vi.spyOn(extensionBuffer, 'offset', 'get').mockReturnValueOnce(
        4_294_967_296,
      );

      const extension: MessagePackExtension = {
        decode: vi.fn<() => void>(),
        encode: vi.fn<() => void>(),
        type: 1,
      };

      expect(() => encoder.writeExtension(extension, extensionBuffer)).toThrow(
        'Extension data too large to encode: 4294967296',
      );
    });
  });

  describe('writeObject', () => {
    it('should call writeArray', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const array = [1, 2, 3];
      const writeArraySpy = vi.spyOn(encoder, 'writeArray');

      encoder.writeObject(array);

      expect(writeArraySpy).toHaveBeenCalledWith(array);
    });

    it('should call writeExtension', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const value = {
        foo: 'bar',
      };

      const encodeFn = vi.fn<
        (value: unknown, extensionBuffer: Encoder) => void
      >((_value, extensionBuffer: Encoder) => {
        extensionBuffer.writeUint8(42);
      });

      const extension: MessagePackExtension = {
        decode: vi.fn<() => void>(),
        encode: encodeFn,
        type: 1,
      };

      const writeExtensionSpy = vi.spyOn(encoder, 'writeExtension');

      encoder.addExtension(extension);
      encoder.writeObject(value);

      expect(encodeFn).toHaveBeenCalledWith(value, expect.any(Encoder));
      expect(writeExtensionSpy).toHaveBeenCalledWith(
        extension,
        expect.any(Encoder),
      );
    });

    it('should call writeUint8Array', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const array = new Uint8Array([1, 2, 3]);
      const writeUint8ArraySpy = vi.spyOn(encoder, 'writeUint8Array');

      encoder.writeObject(array);

      expect(writeUint8ArraySpy).toHaveBeenCalledWith(array);
    });

    it('should call writeMap', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const object = {
        foo: 'bar',
      };

      const writeMapSpy = vi.spyOn(encoder, 'writeMap');

      encoder.writeObject(object);

      expect(writeMapSpy).toHaveBeenCalledWith(object);
    });
  });

  describe('write', () => {
    it('should call writeTrueFlag, ensuring capacity', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const ensureCapacitySpy = vi.spyOn(encoder, 'ensureCapacity');
      const writeTrueFlagSpy = vi.spyOn(encoder, 'writeTrueSymbol');
      const writeNumberSpy = vi.spyOn(encoder, 'writeNumber');

      encoder.write(true);

      expect(ensureCapacitySpy).toHaveBeenCalledWith(1);
      expect(writeTrueFlagSpy).toHaveBeenCalledOnce();
      expect(writeNumberSpy).not.toHaveBeenCalled();
    });

    it('should call writeFalseFlag, ensuring capacity', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const ensureCapacitySpy = vi.spyOn(encoder, 'ensureCapacity');
      const writeFalseFlagSpy = vi.spyOn(encoder, 'writeFalseSymbol');
      const writeNumberSpy = vi.spyOn(encoder, 'writeNumber');

      encoder.write(false);

      expect(ensureCapacitySpy).toHaveBeenCalledWith(1);
      expect(writeFalseFlagSpy).toHaveBeenCalledOnce();
      expect(writeNumberSpy).not.toHaveBeenCalled();
    });

    it('should call writeNumber', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const writeNumberSpy = vi.spyOn(encoder, 'writeNumber');
      const writeStringSpy = vi.spyOn(encoder, 'writeString');

      encoder.write(42);

      expect(writeNumberSpy).toHaveBeenCalledWith(42);
      expect(writeStringSpy).not.toHaveBeenCalled();
    });

    it('should call writeString', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const writeStringSpy = vi.spyOn(encoder, 'writeString');
      const writeNilFlagSpy = vi.spyOn(encoder, 'writeNilSymbol');
      const writeObjectSpy = vi.spyOn(encoder, 'writeObject');

      encoder.write('foo');

      expect(writeStringSpy).toHaveBeenCalledWith('foo');
      expect(writeNilFlagSpy).not.toHaveBeenCalled();
      expect(writeObjectSpy).not.toHaveBeenCalled();
    });

    it('should call writeNilFlag, ensuring capacity with a `null` value', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const ensureCapacitySpy = vi.spyOn(encoder, 'ensureCapacity');
      const writeNilFlagSpy = vi.spyOn(encoder, 'writeNilSymbol');
      const writeObjectSpy = vi.spyOn(encoder, 'writeObject');

      encoder.write(null);

      expect(ensureCapacitySpy).toHaveBeenCalledWith(1);
      expect(writeNilFlagSpy).toHaveBeenCalledOnce();
      expect(writeObjectSpy).not.toHaveBeenCalled();
    });

    it('should call writeNilFlag, ensuring capacity with a `undefined` value', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const ensureCapacitySpy = vi.spyOn(encoder, 'ensureCapacity');
      const writeNilFlagSpy = vi.spyOn(encoder, 'writeNilSymbol');
      const writeObjectSpy = vi.spyOn(encoder, 'writeObject');

      encoder.write(null);

      expect(ensureCapacitySpy).toHaveBeenCalledWith(1);
      expect(writeNilFlagSpy).toHaveBeenCalledOnce();
      expect(writeObjectSpy).not.toHaveBeenCalled();
    });

    it('should fails to encode a negative number that not fit in 64 bytes', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      expect(() => encoder.write(INT64_MIN - 1)).toThrow(
        `Integer too small to encode: ${INT64_MIN - 1}. Consider using BigIntExtension.`,
      );
    });

    it('should call writeObject', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const object = {
        foo: 'bar',
      };

      const writeObjectSpy = vi.spyOn(encoder, 'writeObject');

      encoder.write(object);

      expect(writeObjectSpy).toHaveBeenCalledWith(object);
    });
  });
});

describe('extensions', () => {
  describe('addExtension', () => {
    it('should throw an error if the extension type is already registered', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const extension: MessagePackExtension = {
        decode: vi.fn<() => void>(),
        encode: vi.fn<() => void>(),
        type: 1,
      };

      encoder.addExtension(extension);

      expect(() => encoder.addExtension(extension)).toThrow(
        'Extension with type 1 already exists',
      );
    });

    it('should throw an error if the extension type has a value that is not between 0 and 127', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const negativeExtension: MessagePackExtension = {
        decode: vi.fn<() => void>(),
        encode: vi.fn<() => void>(),
        type: -1,
      };

      const tooLargeExtension: MessagePackExtension = {
        decode: vi.fn<() => void>(),
        encode: vi.fn<() => void>(),
        type: 128,
      };

      expect(() => encoder.addExtension(negativeExtension)).toThrow(
        'Extension type must be a non-negative integer, got -1. Extensions between -128 and -1 are reserved for internal use. Use addInternalExtension() to register an internal extension.',
      );

      expect(() => encoder.addExtension(tooLargeExtension)).toThrow(
        'Extension type must be in the range 0 to 127, got 128',
      );
    });

    it('should add an extension correctly', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const extension: MessagePackExtension = {
        decode: vi.fn<() => void>(),
        encode: vi.fn<() => void>(),
        type: 1,
      };

      expect(encoder.addExtension(extension)).toBe(encoder);
      expect(encoder.fetchExtension(1)).toBe(extension);
    });
  });

  describe('addInternalExtension', () => {
    it('should throw an error if the extension type is already registered', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const extension: MessagePackExtension = {
        decode: vi.fn<() => void>(),
        encode: vi.fn<() => void>(),
        type: -1,
      };

      encoder.addInternalExtension(extension);

      expect(() => encoder.addInternalExtension(extension)).toThrow(
        'Extension with type -1 already exists',
      );
    });

    it('should throw an error if the extension type has a value that is not between -128 and -1', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const nonNegativeExtension: MessagePackExtension = {
        decode: vi.fn<() => void>(),
        encode: vi.fn<() => void>(),
        type: 0,
      };

      const tooSmallExtension: MessagePackExtension = {
        decode: vi.fn<() => void>(),
        encode: vi.fn<() => void>(),
        type: -129,
      };

      expect(() => encoder.addInternalExtension(nonNegativeExtension)).toThrow(
        'Internal extension type must be a negative integer, got 0. Use addExtension() to register a custom extension.',
      );

      expect(() => encoder.addInternalExtension(tooSmallExtension)).toThrow(
        'Internal extension type must be in the range -128 to -1, got -129',
      );
    });

    it('should add an internal extension correctly', () => {
      const encoder = new Encoder({
        initialBufferSize: 1,
      });

      const extension: MessagePackExtension = {
        decode: vi.fn<() => void>(),
        encode: vi.fn<() => void>(),
        type: -1,
      };

      expect(encoder.addInternalExtension(extension)).toBe(encoder);
      expect(encoder.fetchExtension(-1)).toBe(extension);
    });
  });
});

describe('chaining', () => {
  it('check that write complex structures using chained methods', () => {
    const expectedObject = {
      first: 'a',
      second: [1, 2, 3],
      third: {
        nested: true,
      },
    };

    const encoder = new Encoder();

    const chainedResult = encoder
      .openMap(3)
      .writeString('first') // first key
      .writeString('a') // first value
      .writeString('second') // second key
      .openArray(3) // second value
      .writeNumber(1)
      .writeNumber(2)
      .writeNumber(3)
      .writeString('third') // third key
      .openMap(1) // third value
      .writeString('nested') // nested key
      .writeTrueSymbol() // nested value
      .flush();

    const expected = encoder.write(expectedObject).flush();

    expect(chainedResult).toBeBytes(expected);
  });
});
