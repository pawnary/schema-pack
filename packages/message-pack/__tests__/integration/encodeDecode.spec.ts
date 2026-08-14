import { describe, expect, test } from 'vitest';
import Encoder from '../../src/encoder/encoder.ts';
import Decoder from '../../src/decoder/decoder.ts';
import Symbols from '../../src/symbols.ts';
import type MessagePackExtension from '../../src/extensions/interfaces/messagePackExtension.ts';
import {
  INT32_MIN,
  INT64_MIN,
  UINT32_MAX,
  UINT64_MAX,
} from '../../src/constants.ts';

function encode(value: unknown): Uint8Array {
  const encoder = new Encoder();

  return encoder.encode(value);
}

function decode(buffer: Uint8Array): unknown {
  const decoder = new Decoder();

  return decoder.decode(buffer);
}

describe('int', () => {
  test('positive fixint', () => {
    for (
      let i = Symbols.POSITIVE_FIXINT_START;
      i <= Symbols.POSITIVE_FIXINT_END;
      i++
    ) {
      const encoded = encode(i);

      expect(encoded).toBeBytes([i]);
      expect(decode(encoded)).toBe(i);
    }

    expect.assertions(256);
  });

  test('uint 8', () => {
    const uint8 = 255;

    const encoded = encode(uint8);

    expect(encoded).toBeByteAt(0, Symbols.UINT8);
    expect(decode(encoded)).toBe(uint8);
  });

  test('uint 16', () => {
    const uint16 = 65535;

    const encoded = encode(uint16);

    expect(encoded).toBeByteAt(0, Symbols.UINT16);
    expect(decode(encoded)).toBe(uint16);
  });

  test('uint 32', () => {
    const encoded = encode(UINT32_MAX);

    expect(encoded).toBeByteAt(0, Symbols.UINT32);
    expect(decode(encoded)).toBe(UINT32_MAX);
  });

  describe('uint 64', () => {
    test('max uint 64', () => {
      const encoded = encode(UINT64_MAX);

      expect(encoded).toBeByteAt(0, Symbols.UINT64);
      expect(decode(encoded)).toBe(UINT64_MAX);
    });

    test('min uint 64', () => {
      const encoded = encode(UINT32_MAX + 1);

      expect(encoded).toBeByteAt(0, Symbols.UINT64);
      expect(decode(encoded)).toBe(UINT32_MAX + 1);
    });
  });

  test('int 8', () => {
    const int8 = -128;

    const encoded = encode(int8);

    expect(encoded).toBeByteAt(0, Symbols.INT8);
    expect(decode(encoded)).toBe(int8);
  });

  test('int 16', () => {
    const int16 = -32768;

    const encoded = encode(int16);

    expect(encoded).toBeByteAt(0, Symbols.INT16);
    expect(decode(encoded)).toBe(int16);
  });

  test('int 32', () => {
    const int32 = -2147483648;

    const encoded = encode(int32);

    expect(encoded).toBeByteAt(0, Symbols.INT32);
    expect(decode(encoded)).toBe(int32);
  });

  describe('int 64', () => {
    test('min signed int 64', () => {
      const encoded = encode(INT64_MIN);

      expect(encoded).toBeByteAt(0, Symbols.INT64);
      expect(decode(encoded)).toBe(INT64_MIN);
    });

    test('max signed int 64', () => {
      const encoded = encode(INT32_MIN - 1);

      expect(encoded).toBeByteAt(0, Symbols.INT64);
      expect(decode(encoded)).toBe(INT32_MIN - 1);
    });
  });

  test('negative fixint', () => {
    for (let i = -32; i < 0; i++) {
      const encoded = encode(i);

      expect(encoded).toBeByteAt(0, Symbols.NEGATIVE_FIXINT_START + (i + 32));
      expect(decode(encoded)).toBe(i);
    }

    expect.hasAssertions();
  });
});

describe('map', () => {
  test('fixmap', () => {
    for (let i = 0; i <= 15; i++) {
      const fixmap: Record<string, number> = {};

      for (let j = 0; j < i; j++) {
        fixmap[`key${j}`] = j;
      }

      const encoded = encode(fixmap);

      expect(decode(encoded)).toEqual(fixmap);
    }

    expect.assertions(16);
  });

  test('map 16', () => {
    const map16: Record<string, number> = {};

    for (let i = 0; i < 65535; i++) {
      map16[`key${i}`] = i;
    }

    const encoded = encode(map16);

    expect(encoded).toBeByteAt(0, Symbols.MAP16);
    expect(decode(encoded)).toEqual(map16);
  });

  test('map 32', () => {
    const map32: Record<string, number> = {};

    for (let i = 0; i < 65536; i++) {
      map32[`key${i}`] = i;
    }

    const encoded = encode(map32);

    expect(encoded).toBeByteAt(0, Symbols.MAP32);
    expect(decode(encoded)).toEqual(map32);
  });
});

describe('array', () => {
  test('fixarray', () => {
    for (let i = 0; i <= 15; i++) {
      const fixarray: number[] = [];

      for (let j = 0; j < i; j++) {
        fixarray.push(j);
      }

      const encoded = encode(fixarray);

      expect(decode(encoded)).toEqual(fixarray);
    }

    expect.assertions(16);
  });

  test('array 16', () => {
    const array16: number[] = [];

    for (let i = 0; i < 65535; i++) {
      array16.push(i);
    }

    const encoded = encode(array16);

    expect(encoded).toBeByteAt(0, Symbols.ARRAY16);
    expect(decode(encoded)).toEqual(array16);
  });

  test('array 32', () => {
    const array32: number[] = [];

    for (let i = 0; i < 65536; i++) {
      array32.push(i);
    }

    const encoded = encode(array32);

    expect(encoded).toBeByteAt(0, Symbols.ARRAY32);
    expect(decode(encoded)).toEqual(array32);
  });
});

describe('string', () => {
  test('fixstr', () => {
    for (let i = 0; i <= 31; i++) {
      const fixstr = 'a'.repeat(i);

      const encoded = encode(fixstr);

      expect(decode(encoded)).toBe(fixstr);
    }

    expect.hasAssertions();
  });

  test('str 8', () => {
    for (let i = 32; i <= 255; i++) {
      const str8 = 'a'.repeat(i);

      const encoded = encode(str8);

      expect(encoded).toBeByteAt(0, Symbols.STR8);
      expect(decode(encoded)).toBe(str8);
    }

    expect.hasAssertions();
  });

  test('str 16', () => {
    const str16 = 'a'.repeat(65535);

    const encoded = encode(str16);

    expect(encoded).toBeByteAt(0, Symbols.STR16);
    expect(decode(encoded)).toBe(str16);
  });

  test('str 32', () => {
    const str32 = 'a'.repeat(65536);

    const encoded = encode(str32);

    expect(encoded).toBeByteAt(0, Symbols.STR32);
    expect(decode(encoded)).toBe(str32);
  });
});

test('nil', () => {
  const encoded = encode(null);

  expect(encoded).toBeBytes([Symbols.NIL]);
  expect(decode(encoded)).toBe(null);
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
  test('bin 8', () => {
    const bin8 = new Uint8Array(255).fill(1);

    const encoded = encode(bin8);

    expect(encoded).toBeByteAt(0, Symbols.BIN8);
    expect(decode(encoded)).toEqual(bin8);
  });

  test('bin 16', () => {
    const bin16 = new Uint8Array(65535).fill(1);

    const encoded = encode(bin16);

    expect(encoded).toBeByteAt(0, Symbols.BIN16);
    expect(decode(encoded)).toEqual(bin16);
  });

  test('bin 32', () => {
    const bin32 = new Uint8Array(65536).fill(1);

    const encoded = encode(bin32);

    expect(encoded).toBeByteAt(0, Symbols.BIN32);
    expect(decode(encoded)).toEqual(bin32);
  });
});

describe('ext', () => {
  test('ext 8', () => {
    const extension: MessagePackExtension = {
      type: 1,
      encode: (_value, buffer) => {
        for (let i = 0; i < 255; i++) {
          buffer.writeUint8(i);
        }
      },
      decode: () => {
        return {};
      },
    };

    const encoder = new Encoder();
    encoder.addExtension(extension);

    const decoder = new Decoder();
    decoder.addExtension(extension);

    const encoded = encoder.encode({});

    expect(encoded).toBeByteAt(0, Symbols.EXT8);
    expect(decoder.decode(encoded)).toEqual({});
  });

  test('ext 16', () => {
    const extension: MessagePackExtension = {
      type: 1,
      encode: (_value, buffer) => {
        for (let i = 0; i < 65535; i++) {
          buffer.writeUint8(i % 255);
        }
      },
      decode: () => {
        return {};
      },
    };

    const encoder = new Encoder();
    encoder.addExtension(extension);

    const decoder = new Decoder();
    decoder.addExtension(extension);

    const encoded = encoder.encode({});

    expect(encoded).toBeByteAt(0, Symbols.EXT16);
    expect(decoder.decode(encoded)).toEqual({});
  });

  test('ext 32', () => {
    const extension: MessagePackExtension = {
      type: 1,
      encode: (_value, buffer) => {
        for (let i = 0; i < 65536; i++) {
          buffer.writeUint8(i % 255);
        }
      },
      decode: () => {
        return {};
      },
    };

    const encoder = new Encoder();
    encoder.addExtension(extension);

    const decoder = new Decoder();
    decoder.addExtension(extension);

    const encoded = encoder.encode({});

    expect(encoded).toBeByteAt(0, Symbols.EXT32);
    expect(decoder.decode(encoded)).toEqual({});
  });

  test('fixext 1', () => {
    const extension: MessagePackExtension = {
      type: 1,
      encode: (_value, buffer) => {
        buffer.writeUint8(123);
      },
      decode: () => {
        return {};
      },
    };

    const encoder = new Encoder();
    encoder.addExtension(extension);

    const decoder = new Decoder();
    decoder.addExtension(extension);

    const encoded = encoder.encode({});

    expect(encoded).toBeByteAt(0, Symbols.FIXEXT1);
    expect(decoder.decode(encoded)).toEqual({});
  });

  test('fixext 2', () => {
    const extension: MessagePackExtension = {
      type: 1,
      encode: (_value, buffer) => {
        buffer.writeUint8(123);
        buffer.writeUint8(123);
      },
      decode: () => {
        return {};
      },
    };

    const encoder = new Encoder();
    encoder.addExtension(extension);

    const decoder = new Decoder();
    decoder.addExtension(extension);

    const encoded = encoder.encode({});

    expect(encoded).toBeByteAt(0, Symbols.FIXEXT2);
    expect(decoder.decode(encoded)).toEqual({});
  });

  test('fixext 4', () => {
    const extension: MessagePackExtension = {
      type: 1,
      encode: (_value, buffer) => {
        buffer.writeUint8(123);
        buffer.writeUint8(123);
        buffer.writeUint8(123);
        buffer.writeUint8(123);
      },
      decode: () => {
        return {};
      },
    };

    const encoder = new Encoder();
    encoder.addExtension(extension);

    const decoder = new Decoder();
    decoder.addExtension(extension);

    const encoded = encoder.encode({});

    expect(encoded).toBeByteAt(0, Symbols.FIXEXT4);
    expect(decoder.decode(encoded)).toEqual({});
  });

  test('fixext 8', () => {
    const extension: MessagePackExtension = {
      type: 1,
      encode: (_value, buffer) => {
        for (let i = 0; i < 8; i++) {
          buffer.writeUint8(123);
        }
      },
      decode: () => {
        return {};
      },
    };

    const encoder = new Encoder();
    encoder.addExtension(extension);

    const decoder = new Decoder();
    decoder.addExtension(extension);

    const encoded = encoder.encode({});

    expect(encoded).toBeByteAt(0, Symbols.FIXEXT8);
    expect(decoder.decode(encoded)).toEqual({});
  });

  test('fixext 16', () => {
    const extension: MessagePackExtension = {
      type: 1,
      encode: (_value, buffer) => {
        for (let i = 0; i < 16; i++) {
          buffer.writeUint8(123);
        }
      },
      decode: () => {
        return {};
      },
    };

    const encoder = new Encoder();
    encoder.addExtension(extension);

    const decoder = new Decoder();
    decoder.addExtension(extension);

    const encoded = encoder.encode({});

    expect(encoded).toBeByteAt(0, Symbols.FIXEXT16);
    expect(decoder.decode(encoded)).toEqual({});
  });
});

describe('float', () => {
  test('float 32', () => {
    // WARNING: JavaScript only supports 64 bit floating point numbers, we must
    // enforce 32 bit floating point and find a float32 that fits in 32 bits,
    // otherwise the test will fail.
    const float32Encoder = new Encoder({
      forceFloat32: true,
    });

    /**
     * 0.5 fits in 32 bits, but 1.2 loses precision.
     *
     * 1.2 is decoded as 1.2000000476837158 using float32
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

  test('float 64', () => {
    const float64 = -1.2;

    const encoded = encode(float64);

    expect(encoded).toBeByteAt(0, Symbols.FLOAT64);
    expect(decode(encoded)).toBe(float64);
  });
});
