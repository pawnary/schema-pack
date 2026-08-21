import { describe, expect, it, test } from 'vitest';

import {
  INT32_MIN,
  INT64_MIN,
  UINT32_MAX,
  UINT64_MAX,
} from '../../src/constants.ts';
import Decoder from '../../src/decoder/decoder.ts';
import Encoder from '../../src/encoder/encoder.ts';
import type MessagePackExtension from '../../src/extensions/interfaces/messagePackExtension.ts';
import Symbols from '../../src/symbols.ts';

function encode(value: unknown): Uint8Array {
  const encoder = new Encoder();

  return encoder.encode(value);
}

function decode(buffer: Uint8Array): unknown {
  const decoder = new Decoder();

  return decoder.decode(buffer);
}

describe('int', () => {
  it('positive fixint', () => {
    for (
      let index = Symbols.POSITIVE_FIXINT_START;
      // oxlint-disable-next-line typescript/no-unnecessary-condition
      index <= Symbols.POSITIVE_FIXINT_END;
      index++
    ) {
      const encoded = encode(index);

      expect(encoded).toBeBytes([index]);
      expect(decode(encoded)).toBe(index);
    }

    expect.assertions(256);
  });

  it('uint 8', () => {
    const uint8 = 255;

    const encoded = encode(uint8);

    expect(encoded).toBeByteAt(0, Symbols.UINT8);
    expect(decode(encoded)).toBe(uint8);
  });

  it('uint 16', () => {
    const uint16 = 65_535;

    const encoded = encode(uint16);

    expect(encoded).toBeByteAt(0, Symbols.UINT16);
    expect(decode(encoded)).toBe(uint16);
  });

  it('uint 32', () => {
    const encoded = encode(UINT32_MAX);

    expect(encoded).toBeByteAt(0, Symbols.UINT32);
    expect(decode(encoded)).toBe(UINT32_MAX);
  });

  describe('uint 64', () => {
    it('max uint 64', () => {
      const encoded = encode(UINT64_MAX);

      expect(encoded).toBeByteAt(0, Symbols.UINT64);
      expect(decode(encoded)).toBe(UINT64_MAX);
    });

    it('min uint 64', () => {
      const encoded = encode(UINT32_MAX + 1);

      expect(encoded).toBeByteAt(0, Symbols.UINT64);
      expect(decode(encoded)).toBe(UINT32_MAX + 1);
    });
  });

  it('int 8', () => {
    const int8 = -128;

    const encoded = encode(int8);

    expect(encoded).toBeByteAt(0, Symbols.INT8);
    expect(decode(encoded)).toBe(int8);
  });

  it('int 16', () => {
    const int16 = -32_768;

    const encoded = encode(int16);

    expect(encoded).toBeByteAt(0, Symbols.INT16);
    expect(decode(encoded)).toBe(int16);
  });

  it('int 32', () => {
    const int32 = -2_147_483_648;

    const encoded = encode(int32);

    expect(encoded).toBeByteAt(0, Symbols.INT32);
    expect(decode(encoded)).toBe(int32);
  });

  describe('int 64', () => {
    it('min signed int 64', () => {
      const encoded = encode(INT64_MIN);

      expect(encoded).toBeByteAt(0, Symbols.INT64);
      expect(decode(encoded)).toBe(INT64_MIN);
    });

    it('max signed int 64', () => {
      const encoded = encode(INT32_MIN - 1);

      expect(encoded).toBeByteAt(0, Symbols.INT64);
      expect(decode(encoded)).toBe(INT32_MIN - 1);
    });
  });

  it('negative fixint', () => {
    for (let index = -32; index < 0; index++) {
      const encoded = encode(index);

      expect(encoded).toBeByteAt(
        0,
        Symbols.NEGATIVE_FIXINT_START + (index + 32),
      );
      expect(decode(encoded)).toBe(index);
    }

    expect.hasAssertions();
  });
});

describe('map', () => {
  it('fixmap', () => {
    for (let itemIndex = 0; itemIndex <= 15; itemIndex++) {
      const fixmap: Record<string, number> = {};

      for (let index = 0; index < itemIndex; index++) {
        fixmap[`key${index}`] = index;
      }

      const encoded = encode(fixmap);

      expect(decode(encoded)).toStrictEqual(fixmap);
    }

    expect.assertions(16);
  });

  it('map 16', () => {
    const map16: Record<string, number> = {};

    for (let index = 0; index < 65_535; index++) {
      map16[`key${index}`] = index;
    }

    const encoded = encode(map16);

    expect(encoded).toBeByteAt(0, Symbols.MAP16);
    expect(decode(encoded)).toStrictEqual(map16);
  });

  it('map 32', () => {
    const map32: Record<string, number> = {};

    for (let index = 0; index < 65_536; index++) {
      map32[`key${index}`] = index;
    }

    const encoded = encode(map32);

    expect(encoded).toBeByteAt(0, Symbols.MAP32);
    expect(decode(encoded)).toStrictEqual(map32);
  });
});

describe('array', () => {
  it('fixarray', () => {
    for (let itemIndex = 0; itemIndex <= 15; itemIndex++) {
      const fixarray: number[] = [];

      for (let index = 0; index < itemIndex; index++) {
        fixarray.push(index);
      }

      const encoded = encode(fixarray);

      expect(decode(encoded)).toStrictEqual(fixarray);
    }

    expect.assertions(16);
  });

  it('array 16', () => {
    const array16: number[] = [];

    for (let index = 0; index < 65_535; index++) {
      array16.push(index);
    }

    const encoded = encode(array16);

    expect(encoded).toBeByteAt(0, Symbols.ARRAY16);
    expect(decode(encoded)).toStrictEqual(array16);
  });

  it('array 32', () => {
    const array32: number[] = [];

    for (let index = 0; index < 65_536; index++) {
      array32.push(index);
    }

    const encoded = encode(array32);

    expect(encoded).toBeByteAt(0, Symbols.ARRAY32);
    expect(decode(encoded)).toStrictEqual(array32);
  });
});

describe('string', () => {
  it('fixstr', () => {
    for (let index = 0; index <= 31; index++) {
      const fixstr = 'a'.repeat(index);

      const encoded = encode(fixstr);

      expect(decode(encoded)).toBe(fixstr);
    }

    expect.hasAssertions();
  });

  it('str 8', () => {
    for (let index = 32; index <= 255; index++) {
      const str8 = 'a'.repeat(index);

      const encoded = encode(str8);

      expect(encoded).toBeByteAt(0, Symbols.STR8);
      expect(decode(encoded)).toBe(str8);
    }

    expect.hasAssertions();
  });

  it('str 16', () => {
    const str16 = 'a'.repeat(65_535);

    const encoded = encode(str16);

    expect(encoded).toBeByteAt(0, Symbols.STR16);
    expect(decode(encoded)).toBe(str16);
  });

  it('str 32', () => {
    const str32 = 'a'.repeat(65_536);

    const encoded = encode(str32);

    expect(encoded).toBeByteAt(0, Symbols.STR32);
    expect(decode(encoded)).toBe(str32);
  });
});

test('nil', () => {
  const encoded = encode(null);

  expect(encoded).toBeBytes([Symbols.NIL]);
  expect(decode(encoded)).toBeNull();
});

test('false', () => {
  const encoded = encode(false);

  expect(encoded).toBeBytes([Symbols.FALSE]);
  expect(decode(encoded)).toBe(false);
});

test('true', () => {
  const encoded = encode(true);

  expect(encoded).toBeBytes([Symbols.TRUE]);
  expect(decode(encoded)).toBe(true);
});

describe('bin', () => {
  it('bin 8', () => {
    const bin8 = new Uint8Array(255).fill(1);

    const encoded = encode(bin8);

    expect(encoded).toBeByteAt(0, Symbols.BIN8);
    expect(decode(encoded)).toStrictEqual(bin8);
  });

  it('bin 16', () => {
    const bin16 = new Uint8Array(65_535).fill(1);

    const encoded = encode(bin16);

    expect(encoded).toBeByteAt(0, Symbols.BIN16);
    expect(decode(encoded)).toStrictEqual(bin16);
  });

  it('bin 32', () => {
    const bin32 = new Uint8Array(65_536).fill(1);

    const encoded = encode(bin32);

    expect(encoded).toBeByteAt(0, Symbols.BIN32);
    expect(decode(encoded)).toStrictEqual(bin32);
  });
});

describe('ext', () => {
  it('ext 8', () => {
    const extension: MessagePackExtension = {
      decode: () => ({}),
      encode: (_value, buffer) => {
        for (let index = 0; index < 255; index++) {
          buffer.writeUint8(index);
        }
      },
      type: 1,
    };

    const encoder = new Encoder();
    encoder.addExtension(extension);

    const decoder = new Decoder();
    decoder.addExtension(extension);

    const encoded = encoder.encode({});

    expect(encoded).toBeByteAt(0, Symbols.EXT8);
    expect(decoder.decode(encoded)).toStrictEqual({});
  });

  it('ext 16', () => {
    const extension: MessagePackExtension = {
      decode: () => ({}),
      encode: (_value, buffer) => {
        for (let index = 0; index < 65_535; index++) {
          buffer.writeUint8(index % 255);
        }
      },
      type: 1,
    };

    const encoder = new Encoder();
    encoder.addExtension(extension);

    const decoder = new Decoder();
    decoder.addExtension(extension);

    const encoded = encoder.encode({});

    expect(encoded).toBeByteAt(0, Symbols.EXT16);
    expect(decoder.decode(encoded)).toStrictEqual({});
  });

  it('ext 32', () => {
    const extension: MessagePackExtension = {
      decode: () => ({}),
      encode: (_value, buffer) => {
        for (let index = 0; index < 65_536; index++) {
          buffer.writeUint8(index % 255);
        }
      },
      type: 1,
    };

    const encoder = new Encoder();
    encoder.addExtension(extension);

    const decoder = new Decoder();
    decoder.addExtension(extension);

    const encoded = encoder.encode({});

    expect(encoded).toBeByteAt(0, Symbols.EXT32);
    expect(decoder.decode(encoded)).toStrictEqual({});
  });

  it('fixext 1', () => {
    const extension: MessagePackExtension = {
      decode: () => ({}),
      encode: (_value, buffer) => {
        buffer.writeUint8(123);
      },
      type: 1,
    };

    const encoder = new Encoder();
    encoder.addExtension(extension);

    const decoder = new Decoder();
    decoder.addExtension(extension);

    const encoded = encoder.encode({});

    expect(encoded).toBeByteAt(0, Symbols.FIXEXT1);
    expect(decoder.decode(encoded)).toStrictEqual({});
  });

  it('fixext 2', () => {
    const extension: MessagePackExtension = {
      decode: () => ({}),
      encode: (_value, buffer) => {
        buffer.writeUint8(123);
        buffer.writeUint8(123);
      },
      type: 1,
    };

    const encoder = new Encoder();
    encoder.addExtension(extension);

    const decoder = new Decoder();
    decoder.addExtension(extension);

    const encoded = encoder.encode({});

    expect(encoded).toBeByteAt(0, Symbols.FIXEXT2);
    expect(decoder.decode(encoded)).toStrictEqual({});
  });

  it('fixext 4', () => {
    const extension: MessagePackExtension = {
      decode: () => ({}),
      encode: (_value, buffer) => {
        buffer.writeUint8(123);
        buffer.writeUint8(123);
        buffer.writeUint8(123);
        buffer.writeUint8(123);
      },
      type: 1,
    };

    const encoder = new Encoder();
    encoder.addExtension(extension);

    const decoder = new Decoder();
    decoder.addExtension(extension);

    const encoded = encoder.encode({});

    expect(encoded).toBeByteAt(0, Symbols.FIXEXT4);
    expect(decoder.decode(encoded)).toStrictEqual({});
  });

  it('fixext 8', () => {
    const extension: MessagePackExtension = {
      decode: () => ({}),
      encode: (_value, buffer) => {
        for (let index = 0; index < 8; index++) {
          buffer.writeUint8(123);
        }
      },
      type: 1,
    };

    const encoder = new Encoder();
    encoder.addExtension(extension);

    const decoder = new Decoder();
    decoder.addExtension(extension);

    const encoded = encoder.encode({});

    expect(encoded).toBeByteAt(0, Symbols.FIXEXT8);
    expect(decoder.decode(encoded)).toStrictEqual({});
  });

  it('fixext 16', () => {
    const extension: MessagePackExtension = {
      decode: () => ({}),
      encode: (_value, buffer) => {
        for (let index = 0; index < 16; index++) {
          buffer.writeUint8(123);
        }
      },
      type: 1,
    };

    const encoder = new Encoder();
    encoder.addExtension(extension);

    const decoder = new Decoder();
    decoder.addExtension(extension);

    const encoded = encoder.encode({});

    expect(encoded).toBeByteAt(0, Symbols.FIXEXT16);
    expect(decoder.decode(encoded)).toStrictEqual({});
  });
});

describe('float', () => {
  it('float 32', () => {
    // WARNING: JavaScript only supports 64 bit floating point numbers, we must
    // enforce 32 bit floating point and find a float32 that fits in 32 bits,
    // otherwise the test will fail.
    const float32Encoder = new Encoder({
      forceFloat32: true,
    });

    /**
     * 0.5 fits in 32 bits, but 1.2 loses precision.
     *
     * 1.2 is decoded as 1.2000000476837158 using float32.
     */
    const float32 = 0.5;

    // check that float32 fits in 32 bits
    expect(Math.fround(float32), 'The number must fit in 32 bits').toBe(
      float32,
    );

    const encoded = float32Encoder.encode(float32);

    expect(encoded).toBeByteAt(0, Symbols.FLOAT32);
    expect(decode(encoded)).toBe(float32);
  });

  it('float 64', () => {
    const float64 = -1.2;

    const encoded = encode(float64);

    expect(encoded).toBeByteAt(0, Symbols.FLOAT64);
    expect(decode(encoded)).toBe(float64);
  });
});
