// oxlint-disable unicorn/prefer-code-point
import { describe, expect, it, vi } from 'vitest';

import {
  DEFAULT_ALLOCATION_SIZE,
  INT64_MIN,
  UINT64_MAX,
} from '../../src/constants.ts';
import EncoderBuffer from '../../src/encoder/encoderBuffer.ts';
import DefaultTextEncoder from '../../src/encoder/textEncoders/defaultTextEncoder.ts';
import type MessagePackExtension from '../../src/extensions/interfaces/messagePackExtension.ts';
import Symbols from '../../src/symbols.ts';

describe('internal properties', () => {
  class MockBuffer extends EncoderBuffer {
    public getSharedBuffer(): Uint8Array {
      return this.sharedBuffer;
    }

    public getSortKeys(): boolean {
      return this.sortKeys;
    }
  }

  it('default options', () => {
    const buffer = new MockBuffer();

    expect(buffer.buffer).toHaveLength(DEFAULT_ALLOCATION_SIZE);
    expect(buffer.textEncoder).toBeInstanceOf(DefaultTextEncoder);
    expect(buffer.offset).toBe(0);
    expect(buffer.getSortKeys()).toBe(false);
    expect(buffer.getSharedBuffer()).toHaveLength(DEFAULT_ALLOCATION_SIZE);
  });

  it('getExtensionBuffer', () => {
    const buffer = new MockBuffer();

    const extensionBuffer = buffer.getExtensionBuffer();

    expect(extensionBuffer).not.toBe(buffer);
    expect(extensionBuffer.buffer).not.toBe(buffer.buffer);
    expect(extensionBuffer.textEncoder).toBe(buffer.textEncoder);
  });

  it('resizeBuffer', () => {
    const buffer = new MockBuffer({
      initialBufferSize: 1,
    });

    expect(buffer.buffer).toHaveLength(1);

    buffer.resizeBuffer(2);

    expect(buffer.buffer).toHaveLength(2);
  });

  it('ensureCapacity', () => {
    const buffer = new MockBuffer({
      initialBufferSize: 1,
    });

    expect(buffer.buffer).toHaveLength(1);

    buffer.ensureCapacity(2);

    expect(buffer.buffer).toHaveLength(4);
  });

  it('resetBuffer', () => {
    const buffer = new MockBuffer();

    expect(buffer.offset).toBe(0);

    buffer.writeUint8(1);

    expect(buffer.offset).toBe(1);

    buffer.resetBuffer();

    expect(buffer.offset).toBe(0);
  });
});

describe('write primitive types', () => {
  it('writePositiveFixInt', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 1,
    });

    buffer.writePositiveFixInt(42);

    expect(buffer.buffer).toBeBytes([42]);
    expect(buffer.offset).toBe(1);
  });

  it('writeNegativeFixInt', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 1,
    });

    buffer.writeNegativeFixInt(-1);

    expect(buffer.buffer).toBeBytes([255]);
    expect(buffer.offset).toBe(1);
  });

  it('writeBin', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 3,
    });

    expect(buffer.buffer).not.toBeBytes([1, 2, 3]);

    buffer.writeBin(new Uint8Array([1, 2, 3]));

    expect(buffer.buffer).toBeBytes([1, 2, 3]);
    expect(buffer.offset).toBe(3);
  });

  it('writeFloat32', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 4,
    });

    buffer.writeFloat32(1.5);

    expect(buffer.buffer).toBeBytes([63, 192, 0, 0]);
    expect(buffer.offset).toBe(4);
  });

  it('writeFloat64', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 8,
    });

    buffer.writeFloat64(1.5);

    expect(buffer.buffer).toBeBytes([63, 248, 0, 0, 0, 0, 0, 0]);
    expect(buffer.offset).toBe(8);
  });

  it('writeUint8', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 1,
    });

    buffer.writeUint8(128);

    expect(buffer.buffer).toBeBytes([128]);
    expect(buffer.offset).toBe(1);
  });

  it('writeUint16', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 2,
    });

    buffer.writeUint16(256);

    expect(buffer.buffer).toBeBytes([1, 0]);
    expect(buffer.offset).toBe(2);
  });

  it('writeUint32', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 4,
    });

    buffer.writeUint32(65_536);

    expect(buffer.buffer).toBeBytes([0, 1, 0, 0]);
    expect(buffer.offset).toBe(4);
  });

  it('writeUint64', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 8,
    });

    /**
     * See {@link UINT64_MAX} for more information on the maximum value of a
     * uint64 in JavaScript.
     */
    buffer.writeUint64(UINT64_MAX);

    expect(buffer.buffer).toBeBytes([0, 31, 255, 255, 255, 255, 255, 255]);
    expect(buffer.offset).toBe(8);
  });

  it('writeInt8', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 1,
    });

    buffer.writeInt8(-33);

    expect(buffer.buffer).toBeBytes([223]);
    expect(buffer.offset).toBe(1);
  });

  it('writeInt16', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 2,
    });

    buffer.writeInt16(-129);

    expect(buffer.buffer).toBeBytes([255, 127]);
    expect(buffer.offset).toBe(2);
  });

  it('writeInt32', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 4,
    });

    buffer.writeInt32(-32_769);

    expect(buffer.buffer).toBeBytes([255, 255, 127, 255]);
    expect(buffer.offset).toBe(4);
  });

  it('writeInt64', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 8,
    });

    /**
     * See {@link INT64_MIN} for more information on the minimum value of a
     * int64 in JavaScript.
     */
    buffer.writeInt64(INT64_MIN);

    expect(buffer.buffer).toBeBytes([255, 224, 0, 0, 0, 0, 0, 1]);
    expect(buffer.offset).toBe(8);
  });

  it('writeStr', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 3,
    });

    buffer.writeStr('foo');

    expect(buffer.buffer).toBeBytes([102, 111, 111]);
    expect(buffer.offset).toBe(3);
  });
});

describe('write symbols', () => {
  it('writeNilSymbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 1,
    });

    buffer.writeNilSymbol();

    expect(buffer.buffer).toBeBytes([Symbols.NIL]);
    expect(buffer.offset).toBe(1);
  });

  it('writeFalseSymbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 1,
    });

    buffer.writeFalseSymbol();

    expect(buffer.buffer).toBeBytes([Symbols.FALSE]);
    expect(buffer.offset).toBe(1);
  });

  it('writeTrueSymbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 1,
    });

    buffer.writeTrueSymbol();

    expect(buffer.buffer).toBeBytes([Symbols.TRUE]);
    expect(buffer.offset).toBe(1);
  });

  it('writeFixMapSymbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 1,
    });

    buffer.writeFixMapSymbol(3);

    expect(buffer.buffer).toBeBytes([Symbols.FIXMAP_START | 3]);
    expect(buffer.offset).toBe(1);
  });

  it('writeFixArraySymbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 1,
    });

    buffer.writeFixArraySymbol(3);

    expect(buffer.buffer).toBeBytes([Symbols.FIXARRAY_START | 3]);
    expect(buffer.offset).toBe(1);
  });

  it('writeFixStrSymbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 1,
    });

    buffer.writeFixStrSymbol(3);

    expect(buffer.buffer).toBeBytes([Symbols.FIXSTR_START | 3]);
    expect(buffer.offset).toBe(1);
  });

  it('writeBin8Symbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 2,
    });

    buffer.writeBin8Symbol(3);

    expect(buffer.buffer).toBeBytes([Symbols.BIN8, 3]);
    expect(buffer.offset).toBe(2);
  });

  it('writeBin16Symbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 3,
    });

    buffer.writeBin16Symbol(3);

    expect(buffer.buffer).toBeBytes([Symbols.BIN16, 0, 3]);
    expect(buffer.offset).toBe(3);
  });

  it('writeBin32Symbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 5,
    });

    buffer.writeBin32Symbol(3);

    expect(buffer.buffer).toBeBytes([Symbols.BIN32, 0, 0, 0, 3]);
    expect(buffer.offset).toBe(5);
  });

  it('writeFloat32Symbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 1,
    });

    buffer.writeFloat32Symbol();

    expect(buffer.buffer).toBeBytes([Symbols.FLOAT32]);
    expect(buffer.offset).toBe(1);
  });

  it('writeFloat64Symbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 1,
    });

    buffer.writeFloat64Symbol();

    expect(buffer.buffer).toBeBytes([Symbols.FLOAT64]);
    expect(buffer.offset).toBe(1);
  });

  it('writeUint8Symbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 1,
    });

    buffer.writeUint8Symbol();

    expect(buffer.buffer).toBeBytes([Symbols.UINT8]);
    expect(buffer.offset).toBe(1);
  });

  it('writeUint16Symbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 1,
    });

    buffer.writeUint16Symbol();

    expect(buffer.buffer).toBeBytes([Symbols.UINT16]);
    expect(buffer.offset).toBe(1);
  });

  it('writeUint32Symbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 1,
    });

    buffer.writeUint32Symbol();

    expect(buffer.buffer).toBeBytes([Symbols.UINT32]);
    expect(buffer.offset).toBe(1);
  });

  it('writeUint64Symbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 1,
    });

    buffer.writeUint64Symbol();

    expect(buffer.buffer).toBeBytes([Symbols.UINT64]);
    expect(buffer.offset).toBe(1);
  });

  it('writeInt8Symbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 1,
    });

    buffer.writeInt8Symbol();

    expect(buffer.buffer).toBeBytes([Symbols.INT8]);
    expect(buffer.offset).toBe(1);
  });

  it('writeInt16Symbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 1,
    });

    buffer.writeInt16Symbol();

    expect(buffer.buffer).toBeBytes([Symbols.INT16]);
    expect(buffer.offset).toBe(1);
  });

  it('writeInt32Symbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 1,
    });

    buffer.writeInt32Symbol();

    expect(buffer.buffer).toBeBytes([Symbols.INT32]);
    expect(buffer.offset).toBe(1);
  });

  it('writeInt64Symbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 1,
    });

    buffer.writeInt64Symbol();

    expect(buffer.buffer).toBeBytes([Symbols.INT64]);
    expect(buffer.offset).toBe(1);
  });

  it('writeStr8Symbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 2,
    });

    buffer.writeStr8Symbol(3);

    expect(buffer.buffer).toBeBytes([Symbols.STR8, 3]);
    expect(buffer.offset).toBe(2);
  });

  it('writeStr16Symbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 3,
    });

    buffer.writeStr16Symbol(4);

    expect(buffer.buffer).toBeBytes([Symbols.STR16, 0, 4]);
    expect(buffer.offset).toBe(3);
  });

  it('writeStr32Symbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 5,
    });

    buffer.writeStr32Symbol(4);

    expect(buffer.buffer).toBeBytes([Symbols.STR32, 0, 0, 0, 4]);
    expect(buffer.offset).toBe(5);
  });

  it('writeArray16Symbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 3,
    });

    buffer.writeArray16Symbol(4);

    expect(buffer.buffer).toBeBytes([Symbols.ARRAY16, 0, 4]);
    expect(buffer.offset).toBe(3);
  });

  it('writeArray32Symbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 5,
    });

    buffer.writeArray32Symbol(4);

    expect(buffer.buffer).toBeBytes([Symbols.ARRAY32, 0, 0, 0, 4]);
    expect(buffer.offset).toBe(5);
  });

  it('writeMap16Symbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 3,
    });

    buffer.writeMap16Symbol(4);

    expect(buffer.buffer).toBeBytes([Symbols.MAP16, 0, 4]);
    expect(buffer.offset).toBe(3);
  });

  it('writeMap32Symbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 5,
    });

    buffer.writeMap32Symbol(4);

    expect(buffer.buffer).toBeBytes([Symbols.MAP32, 0, 0, 0, 4]);
    expect(buffer.offset).toBe(5);
  });

  it('writeFixExt1Symbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 2,
    });

    buffer.writeFixExt1Symbol(1);

    expect(buffer.buffer).toBeBytes([Symbols.FIXEXT1, 1]);
    expect(buffer.offset).toBe(2);
  });

  it('writeFixExt2Symbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 2,
    });

    buffer.writeFixExt2Symbol(1);

    expect(buffer.buffer).toBeBytes([Symbols.FIXEXT2, 1]);
    expect(buffer.offset).toBe(2);
  });

  it('writeFixExt4Symbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 2,
    });

    buffer.writeFixExt4Symbol(1);

    expect(buffer.buffer).toBeBytes([Symbols.FIXEXT4, 1]);
    expect(buffer.offset).toBe(2);
  });

  it('writeFixExt8Symbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 2,
    });

    buffer.writeFixExt8Symbol(1);

    expect(buffer.buffer).toBeBytes([Symbols.FIXEXT8, 1]);
    expect(buffer.offset).toBe(2);
  });

  it('writeFixExt16Symbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 2,
    });

    buffer.writeFixExt16Symbol(1);

    expect(buffer.buffer).toBeBytes([Symbols.FIXEXT16, 1]);
    expect(buffer.offset).toBe(2);
  });

  it('writeExt8Symbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 3,
    });

    buffer.writeExt8Symbol(1, 2);

    expect(buffer.buffer).toBeBytes([Symbols.EXT8, 2, 1]);
    expect(buffer.offset).toBe(3);
  });

  it('writeExt16Symbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 4,
    });

    buffer.writeExt16Symbol(1, 2);

    expect(buffer.buffer).toBeBytes([Symbols.EXT16, 0, 2, 1]);
    expect(buffer.offset).toBe(4);
  });

  it('writeExt32Symbol', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 6,
    });

    buffer.writeExt32Symbol(1, 2);

    expect(buffer.buffer).toBeBytes([Symbols.EXT32, 0, 0, 0, 2, 1]);
    expect(buffer.offset).toBe(6);
  });
});

describe('general writing', () => {
  describe('writeString', () => {
    it('should write a fix str', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      buffer.writeString('a'.repeat(31));

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([
        Symbols.FIXSTR_START | 31,
        ...new Array<number>(31).fill(97),
      ]);
    });

    it('should write a str8', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      buffer.writeString('a'.repeat(32));

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([
        Symbols.STR8,
        32,
        ...new Array<number>(32).fill(97),
      ]);
    });

    it('should write a str8 with a multi-byte character', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      buffer.writeString('á'.repeat(32));

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([
        Symbols.STR8,
        64,
        // oxlint-disable-next-line unicorn/no-array-fill-with-reference-type
        ...new Array<number[]>(32).fill([195, 161]).flat(),
      ]);
    });

    it('should write a str8 bypassing the threshold', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      buffer.writeString('a'.repeat(51));

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([
        Symbols.STR8,
        51,
        ...new Array<number>(51).fill(97),
      ]);
    });

    it('should write a str16', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      buffer.writeString('á'.repeat(256));

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([
        Symbols.STR16,
        2,
        0,
        // oxlint-disable-next-line unicorn/no-array-fill-with-reference-type
        ...new Array<number[]>(256).fill([195, 161]).flat(),
      ]);
    });

    it('should write a str32', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      buffer.writeString('á'.repeat(65_536));

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([
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

  describe('writeNumber', () => {
    it('should encode a negative fix int', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      buffer.writeNumber(-10);

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([
        Symbols.NEGATIVE_FIXINT_START | (-10 + 32),
      ]);
    });

    it('should encode a int 8', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      buffer.writeNumber(-128);

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([
        Symbols.INT8,
        128,
      ]);
    });

    it('should encode a int 16', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      buffer.writeNumber(-32_768);

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([
        Symbols.INT16,
        128,
        0,
      ]);
    });

    it('should encode a int 32', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      buffer.writeNumber(-2_147_483_648);

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([
        Symbols.INT32,
        128,
        0,
        0,
        0,
      ]);
    });

    it('should encode a int 64', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      buffer.writeNumber(-2_147_483_649);

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([
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

    it('should encode a positive fix int', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      buffer.writeNumber(127);

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([127]);
    });

    it('should encode a uint 8', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      buffer.writeNumber(255);

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([
        Symbols.UINT8,
        255,
      ]);
    });

    it('should encode a uint 16', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      buffer.writeNumber(65_535);

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([
        Symbols.UINT16,
        255,
        255,
      ]);
    });

    it('should encode a uint 32', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      buffer.writeNumber(4_294_967_295);

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([
        Symbols.UINT32,
        255,
        255,
        255,
        255,
      ]);
    });

    it('should encode a uint 64', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      buffer.writeNumber(Number.MAX_SAFE_INTEGER);

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([
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

    it('should encode a float 64', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      buffer.writeNumber(1.1);

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([
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

  describe('writeMap', () => {
    describe('openMap', () => {
      it('should open a fixmap', () => {
        const buffer = new EncoderBuffer({
          initialBufferSize: 1,
        });

        buffer.openMap(15);

        expect(buffer.flush()).toBeBytes([Symbols.FIXMAP_START | 15]);
      });

      it('should open a map16', () => {
        const buffer = new EncoderBuffer({
          initialBufferSize: 1,
        });

        buffer.openMap(65_535);

        expect(buffer.flush()).toBeBytes([Symbols.MAP16, 255, 255]);
      });

      it('should open a map32', () => {
        const buffer = new EncoderBuffer({
          initialBufferSize: 1,
        });

        buffer.openMap(65_536);

        expect(buffer.flush()).toBeBytes([Symbols.MAP32, 0, 1, 0, 0]);
      });

      it('should throw an error if the map is too big', () => {
        const buffer = new EncoderBuffer({
          initialBufferSize: 1,
        });

        expect(() => buffer.openMap(4_294_967_296)).toThrow(
          'Map size 4294967296 exceeds maximum allowed size of 4294967295',
        );
      });
    });

    it('should write a fix map', () => {
      const buffer = new EncoderBuffer({
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

      buffer.writeMap(object);

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([
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
      const buffer = new EncoderBuffer({
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

      buffer.writeMap(object);

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([
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
      const buffer = new EncoderBuffer({
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

      buffer.writeMap(object);

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes(expected);
    });
  });

  describe('writeArray', () => {
    describe('openArray', () => {
      it('should open a fixarray', () => {
        const buffer = new EncoderBuffer({
          initialBufferSize: 1,
        });

        buffer.openArray(15);

        expect(buffer.flush()).toBeBytes([Symbols.FIXARRAY_START | 15]);
      });

      it('should open an array16', () => {
        const buffer = new EncoderBuffer({
          initialBufferSize: 1,
        });

        buffer.openArray(65_535);

        expect(buffer.flush()).toBeBytes([Symbols.ARRAY16, 255, 255]);
      });

      it('should open an array32', () => {
        const buffer = new EncoderBuffer({
          initialBufferSize: 1,
        });

        buffer.openArray(65_536);

        expect(buffer.flush()).toBeBytes([Symbols.ARRAY32, 0, 1, 0, 0]);
      });

      it('should throw an error if the array is too big', () => {
        const buffer = new EncoderBuffer({
          initialBufferSize: 1,
        });

        expect(() => buffer.openArray(4_294_967_296)).toThrow(
          'Array size 4294967296 exceeds maximum allowed size of 4294967295',
        );
      });
    });

    it('should write a fix array', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      const array = new Array(15).fill(0);

      buffer.writeArray(array);

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([
        Symbols.FIXARRAY_START | 15,
        ...new Array<number>(15).fill(0),
      ]);
    });

    it('should write an array 16', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      const array = new Array(16).fill(0);

      buffer.writeArray(array);

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([
        Symbols.ARRAY16,
        0,
        16,
        ...new Array<number>(16).fill(0),
      ]);
    });

    it('should write an array 32', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      const array = new Array(65_536).fill(0);

      buffer.writeArray(array);

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([
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
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      const array = new Uint8Array([1, 2, 3]);

      buffer.writeUint8Array(array);

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([
        Symbols.BIN8,
        3,
        1,
        2,
        3,
      ]);
    });

    it('should write a bin 16', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      const array = new Uint8Array(256);

      buffer.writeUint8Array(array);

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([
        Symbols.BIN16,
        1,
        0,
        ...new Array<number>(256).fill(0),
      ]);
    });

    it('should write a bin 32', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      const array = new Uint8Array(65_536);

      buffer.writeUint8Array(array);

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([
        Symbols.BIN32,
        0,
        1,
        0,
        0,
        ...new Array<number>(65_536).fill(0),
      ]);
    });

    it('should throw an error if the uint8 array is too big', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      // const array = {
      //   length: 4_294_967_296,
      // } as unknown as Uint8Array;
      const array = new Uint8Array(4_294_967_296);

      expect(() => buffer.writeUint8Array(array)).toThrow(
        'Uint8Array too large to encode: 4294967296',
      );
    });
  });

  describe('writeExtension', () => {
    it('should encode a fixext 1', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      const extensionBuffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      extensionBuffer.writeUint8(42);

      const extension: MessagePackExtension = {
        decode: vi.fn<() => void>(),
        encode: vi.fn<() => void>(),
        type: 1,
      };

      buffer.writeExtension(extension, extensionBuffer);

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([
        Symbols.FIXEXT1,
        1,
        42,
      ]);
    });

    it('should encode a fixext 2', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      const extensionBuffer = new EncoderBuffer({
        initialBufferSize: 2,
      });

      extensionBuffer.writeBin(new Uint8Array(2).fill(42));

      const extension: MessagePackExtension = {
        decode: vi.fn<() => void>(),
        encode: vi.fn<() => void>(),
        type: 1,
      };

      buffer.writeExtension(extension, extensionBuffer);

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([
        Symbols.FIXEXT2,
        1,
        ...new Array<number>(2).fill(42),
      ]);
    });

    it('should encode a fixext 4', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      const extensionBuffer = new EncoderBuffer({
        initialBufferSize: 4,
      });

      extensionBuffer.writeBin(new Uint8Array(4).fill(42));

      const extension: MessagePackExtension = {
        decode: vi.fn<() => void>(),
        encode: vi.fn<() => void>(),
        type: 1,
      };

      buffer.writeExtension(extension, extensionBuffer);

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([
        Symbols.FIXEXT4,
        1,
        ...new Array<number>(4).fill(42),
      ]);
    });

    it('should encode a fixext 8', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      const extensionBuffer = new EncoderBuffer({
        initialBufferSize: 8,
      });

      extensionBuffer.writeBin(new Uint8Array(8).fill(42));

      const extension: MessagePackExtension = {
        decode: vi.fn<() => void>(),
        encode: vi.fn<() => void>(),
        type: 1,
      };

      buffer.writeExtension(extension, extensionBuffer);

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([
        Symbols.FIXEXT8,
        1,
        ...new Array<number>(8).fill(42),
      ]);
    });

    it('should encode a fixext 16', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      const extensionBuffer = new EncoderBuffer({
        initialBufferSize: 16,
      });

      extensionBuffer.writeBin(new Uint8Array(16).fill(42));

      const extension: MessagePackExtension = {
        decode: vi.fn<() => void>(),
        encode: vi.fn<() => void>(),
        type: 1,
      };

      buffer.writeExtension(extension, extensionBuffer);

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([
        Symbols.FIXEXT16,
        1,
        ...new Array<number>(16).fill(42),
      ]);
    });

    it('should encode a ext 8', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      const extensionBuffer = new EncoderBuffer({
        initialBufferSize: 3,
      });

      extensionBuffer.writeBin(new Uint8Array(3).fill(42));

      const extension: MessagePackExtension = {
        decode: vi.fn<() => void>(),
        encode: vi.fn<() => void>(),
        type: 1,
      };

      buffer.writeExtension(extension, extensionBuffer);

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([
        Symbols.EXT8,
        3,
        1,
        ...new Array<number>(3).fill(42),
      ]);
    });

    it('should encode a ext 16', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      const extensionBuffer = new EncoderBuffer({
        initialBufferSize: 256,
      });

      extensionBuffer.writeBin(new Uint8Array(256).fill(42));

      const extension: MessagePackExtension = {
        decode: vi.fn<() => void>(),
        encode: vi.fn<() => void>(),
        type: 1,
      };

      buffer.writeExtension(extension, extensionBuffer);

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([
        Symbols.EXT16,
        1,
        0,
        1,
        ...new Array<number>(256).fill(42),
      ]);
    });

    it('should encode a ext 32', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      const extensionBuffer = new EncoderBuffer({
        initialBufferSize: 65_536,
      });

      extensionBuffer.writeBin(new Uint8Array(65_536).fill(42));

      const extension: MessagePackExtension = {
        decode: vi.fn<() => void>(),
        encode: vi.fn<() => void>(),
        type: 1,
      };

      buffer.writeExtension(extension, extensionBuffer);

      expect(buffer.buffer.slice(0, buffer.offset)).toBeBytes([
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
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      const extensionBuffer = new EncoderBuffer({
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

      expect(() => buffer.writeExtension(extension, extensionBuffer)).toThrow(
        'Extension data too large to encode: 4294967296',
      );
    });
  });

  it('should fails with bigint with no extensions', () => {
    const buffer = new EncoderBuffer({
      initialBufferSize: 1,
    });

    const value = 1n;

    expect(() => buffer.writeBigInt(value)).toThrow(
      '"bigint" encoding is not supported by default. Consider using BigIntExtension',
    );
  });

  describe('writeObject', () => {
    it('should call writeArray', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      const array = [1, 2, 3];
      const writeArraySpy = vi.spyOn(buffer, 'writeArray');

      buffer.writeObject(array);

      expect(writeArraySpy).toHaveBeenCalledWith(array);
    });

    it('should call writeExtension', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      const value = {
        foo: 'bar',
      };

      const encodeFn = vi.fn<
        (value: unknown, extensionBuffer: EncoderBuffer) => void
      >((_value, extensionBuffer: EncoderBuffer) => {
        extensionBuffer.writeUint8(42);
      });

      const extension: MessagePackExtension = {
        decode: vi.fn<() => void>(),
        encode: encodeFn,
        type: 1,
      };

      const writeExtensionSpy = vi.spyOn(buffer, 'writeExtension');

      buffer.addExtension(extension);
      buffer.writeObject(value);

      expect(encodeFn).toHaveBeenCalledWith(value, expect.any(EncoderBuffer));
      expect(writeExtensionSpy).toHaveBeenCalledWith(
        extension,
        expect.any(EncoderBuffer),
      );
    });

    it('should call writeUint8Array', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      const array = new Uint8Array([1, 2, 3]);
      const writeUint8ArraySpy = vi.spyOn(buffer, 'writeUint8Array');

      buffer.writeObject(array);

      expect(writeUint8ArraySpy).toHaveBeenCalledWith(array);
    });

    it('should call writeMap', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      const object = {
        foo: 'bar',
      };

      const writeMapSpy = vi.spyOn(buffer, 'writeMap');

      buffer.writeObject(object);

      expect(writeMapSpy).toHaveBeenCalledWith(object);
    });
  });

  describe('write', () => {
    it('should call writeTrueFlag, ensuring capacity', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      const ensureCapacitySpy = vi.spyOn(buffer, 'ensureCapacity');
      const writeTrueFlagSpy = vi.spyOn(buffer, 'writeTrueSymbol');
      const writeNumberSpy = vi.spyOn(buffer, 'writeNumber');

      buffer.write(true);

      expect(ensureCapacitySpy).toHaveBeenCalledWith(1);
      expect(writeTrueFlagSpy).toHaveBeenCalledOnce();
      expect(writeNumberSpy).not.toHaveBeenCalled();
    });

    it('should call writeFalseFlag, ensuring capacity', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      const ensureCapacitySpy = vi.spyOn(buffer, 'ensureCapacity');
      const writeFalseFlagSpy = vi.spyOn(buffer, 'writeFalseSymbol');
      const writeNumberSpy = vi.spyOn(buffer, 'writeNumber');

      buffer.write(false);

      expect(ensureCapacitySpy).toHaveBeenCalledWith(1);
      expect(writeFalseFlagSpy).toHaveBeenCalledOnce();
      expect(writeNumberSpy).not.toHaveBeenCalled();
    });

    it('should call writeNumber', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      const writeNumberSpy = vi.spyOn(buffer, 'writeNumber');
      const writeStringSpy = vi.spyOn(buffer, 'writeString');

      buffer.write(42);

      expect(writeNumberSpy).toHaveBeenCalledWith(42);
      expect(writeStringSpy).not.toHaveBeenCalled();
    });

    it('should call writeString', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      const writeStringSpy = vi.spyOn(buffer, 'writeString');
      const writeNilFlagSpy = vi.spyOn(buffer, 'writeNilSymbol');
      const writeObjectSpy = vi.spyOn(buffer, 'writeObject');

      buffer.write('foo');

      expect(writeStringSpy).toHaveBeenCalledWith('foo');
      expect(writeNilFlagSpy).not.toHaveBeenCalled();
      expect(writeObjectSpy).not.toHaveBeenCalled();
    });

    it('should call writeNilFlag, ensuring capacity with a `null` value', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      const ensureCapacitySpy = vi.spyOn(buffer, 'ensureCapacity');
      const writeNilFlagSpy = vi.spyOn(buffer, 'writeNilSymbol');
      const writeObjectSpy = vi.spyOn(buffer, 'writeObject');

      buffer.write(null);

      expect(ensureCapacitySpy).toHaveBeenCalledWith(1);
      expect(writeNilFlagSpy).toHaveBeenCalledOnce();
      expect(writeObjectSpy).not.toHaveBeenCalled();
    });

    it('should call writeNilFlag, ensuring capacity with a `undefined` value', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      const ensureCapacitySpy = vi.spyOn(buffer, 'ensureCapacity');
      const writeNilFlagSpy = vi.spyOn(buffer, 'writeNilSymbol');
      const writeObjectSpy = vi.spyOn(buffer, 'writeObject');

      buffer.write(null);

      expect(ensureCapacitySpy).toHaveBeenCalledWith(1);
      expect(writeNilFlagSpy).toHaveBeenCalledOnce();
      expect(writeObjectSpy).not.toHaveBeenCalled();
    });

    it('should fails to encode a negative number that not fit in 64 bytes', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      expect(() => buffer.write(INT64_MIN - 1)).toThrow(
        `Integer too small to encode: ${INT64_MIN - 1}. Consider using BigIntExtension.`,
      );
    });

    it('should call writeObject', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      const object = {
        foo: 'bar',
      };

      const writeObjectSpy = vi.spyOn(buffer, 'writeObject');

      buffer.write(object);

      expect(writeObjectSpy).toHaveBeenCalledWith(object);
    });
  });
});

describe('extensions', () => {
  describe('addExtension', () => {
    it('should throw an error if the extension type is already registered', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      const extension: MessagePackExtension = {
        decode: vi.fn<() => void>(),
        encode: vi.fn<() => void>(),
        type: 1,
      };

      buffer.addExtension(extension);

      expect(() => buffer.addExtension(extension)).toThrow(
        'Extension with type 1 already exists',
      );
    });

    it('should throw an error if the extension type has a value that is not between 0 and 127', () => {
      const buffer = new EncoderBuffer({
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

      expect(() => buffer.addExtension(negativeExtension)).toThrow(
        'Extension type must be a non-negative integer, got -1. Extensions between -128 and -1 are reserved for internal use. Use addInternalExtension() to register an internal extension.',
      );

      expect(() => buffer.addExtension(tooLargeExtension)).toThrow(
        'Extension type must be in the range 0 to 127, got 128',
      );
    });

    it('should add an extension correctly', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      const extension: MessagePackExtension = {
        decode: vi.fn<() => void>(),
        encode: vi.fn<() => void>(),
        type: 1,
      };

      expect(buffer.addExtension(extension)).toBe(buffer);
      expect(buffer.fetchExtension(1)).toBe(extension);
    });
  });

  describe('addInternalExtension', () => {
    it('should throw an error if the extension type is already registered', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      const extension: MessagePackExtension = {
        decode: vi.fn<() => void>(),
        encode: vi.fn<() => void>(),
        type: -1,
      };

      buffer.addInternalExtension(extension);

      expect(() => buffer.addInternalExtension(extension)).toThrow(
        'Extension with type -1 already exists',
      );
    });

    it('should throw an error if the extension type has a value that is not between -128 and -1', () => {
      const buffer = new EncoderBuffer({
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

      expect(() => buffer.addInternalExtension(nonNegativeExtension)).toThrow(
        'Internal extension type must be a negative integer, got 0. Use addExtension() to register a custom extension.',
      );

      expect(() => buffer.addInternalExtension(tooSmallExtension)).toThrow(
        'Internal extension type must be in the range -128 to -1, got -129',
      );
    });

    it('should add an internal extension correctly', () => {
      const buffer = new EncoderBuffer({
        initialBufferSize: 1,
      });

      const extension: MessagePackExtension = {
        decode: vi.fn<() => void>(),
        encode: vi.fn<() => void>(),
        type: -1,
      };

      expect(buffer.addInternalExtension(extension)).toBe(buffer);
      expect(buffer.fetchExtension(-1)).toBe(extension);
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

    const buffer = new EncoderBuffer();

    const chainedResult = buffer
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

    const expected = buffer.write(expectedObject).flush();

    expect(chainedResult).toBeBytes(expected);
  });
});
