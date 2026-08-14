import { expect, test, vi } from 'vitest';
import Debugger from '../../../src/debugger.ts';

import { Encoder, Symbols } from '@schema-pack/message-pack';
import messagePackDebugSymbols from '../../../src/debugSymbols/messagePack.ts';
import { inspect } from 'node:util';

const serializerDebugger = new Debugger(messagePackDebugSymbols);
const encoder = new Encoder();

test('positive fixint', () => {
  for (
    let i = Symbols.POSITIVE_FIXINT_START;
    i <= Symbols.POSITIVE_FIXINT_END;
    i++
  ) {
    const encoded = encoder.encode(i);
    const chunks = serializerDebugger.debug(encoded);

    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toStrictEqual({
      flag: i,
      startOffset: 0,
      endOffset: 0, // fixuint has only one byte for flag and no additional information
      description: expect.any(String),
    });
  }

  expect.assertions(128 * 2);
});

test('fixstr', () => {
  for (let i = Symbols.FIXSTR_START; i <= Symbols.FIXSTR_END; i++) {
    const strLength = i - Symbols.FIXSTR_START;
    const str = 'a'.repeat(strLength);

    let expectedEndOffset = 0;
    let expectedStartOffset = 0;

    if (str.length > 0) {
      expectedStartOffset = 1;
      expectedEndOffset = strLength;
    }

    const encoded = encoder.encode(str);
    const chunks = serializerDebugger.debug(encoded);

    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toMatchObject({
      flag: i,
      startOffset: 0,
      endOffset: encoded.length - 1,
      description: expect.any(String),
      informationBytes: {
        startOffset: expectedStartOffset,
        endOffset: expectedEndOffset,
      },
    });
  }

  expect.assertions(32 * 2);
});

test('fixmap', () => {
  for (let i = Symbols.FIXMAP_START; i <= Symbols.FIXMAP_END; i++) {
    const mapSize = i - Symbols.FIXMAP_START;
    const map: Record<string, number> = {};

    for (let j = 0; j < mapSize; j++) {
      map[j] = j;
    }

    const encoded = encoder.encode(map);
    const chunks = serializerDebugger.debug(encoded);

    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toMatchObject({
      flag: i,
      startOffset: 0,
      endOffset: encoded.length - 1,
      description: expect.any(String),
      children: expect.any(Array),
    });
    expect(chunks[0].children).toHaveLength(mapSize * 2);
  }

  expect.assertions(16 * 3);
});

test('fixarray', () => {
  for (let i = Symbols.FIXARRAY_START; i <= Symbols.FIXARRAY_END; i++) {
    const arraySize = i - Symbols.FIXARRAY_START;

    const array: number[] = [];

    for (let j = 0; j < arraySize; j++) {
      array.push(j);
    }

    const encoded = encoder.encode(array);
    const chunks = serializerDebugger.debug(encoded);

    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toMatchObject({
      flag: i,
      startOffset: 0,
      endOffset: encoded.length - 1,
      description: expect.any(String),
      children: expect.any(Array),
    });
    expect(chunks[0].children).toHaveLength(arraySize);
  }

  expect.assertions(16 * 3);
});

test('nil', () => {
  const encoded = encoder.encode(null);
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toStrictEqual({
    flag: Symbols.NIL,
    startOffset: 0,
    endOffset: 0, // nil has only one byte for flag and no additional information
    description: expect.any(String),
  });
});

test('false', () => {
  const encoded = encoder.encode(false);
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toStrictEqual({
    flag: Symbols.FALSE,
    startOffset: 0,
    endOffset: 0, // false has only one byte for flag and no additional information
    description: expect.any(String),
  });
});

test('true', () => {
  const encoded = encoder.encode(true);
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toStrictEqual({
    flag: Symbols.TRUE,
    startOffset: 0,
    endOffset: 0, // true has only one byte for flag and no additional information
    description: expect.any(String),
  });
});

test('bin8', () => {
  const data = new Uint8Array([1, 2, 3, 4, 5]);
  const encoded = encoder.encode(data);
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    flag: Symbols.BIN8,
    startOffset: 0,
    endOffset: 6, // bin8 has one byte for flag, one byte for length, and 5 bytes for data
    description: expect.any(String),
    additionalBytes: [
      {
        startOffset: 1,
        endOffset: 1,
      },
    ],
    informationBytes: {
      startOffset: 2,
      endOffset: 6,
    },
  });
});

test('bin16', () => {
  const data = new Uint8Array(256).fill(42); // 256 bytes of data
  const encoded = encoder.encode(data);
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    flag: Symbols.BIN16,
    startOffset: 0,
    endOffset: 258, // bin16 has one byte for flag, two bytes for length, and 256 bytes for data
    description: expect.any(String),
    additionalBytes: [
      {
        startOffset: 1,
        endOffset: 2,
      },
    ],
    informationBytes: {
      startOffset: 3,
      endOffset: 258,
    },
  });
});

test('bin32', () => {
  const data = new Uint8Array(65536).fill(99); // 65536 bytes of data
  const encoded = encoder.encode(data);
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    flag: Symbols.BIN32,
    startOffset: 0,
    endOffset: 65540, // bin32 has one byte for flag, four bytes for length, and 65536 bytes for data
    description: expect.any(String),
    additionalBytes: [
      {
        startOffset: 1,
        endOffset: 4,
      },
    ],
    informationBytes: {
      startOffset: 5,
      endOffset: 65540,
    },
  });
});

test('ext 8', () => {
  const encoder = new Encoder();
  encoder.addExtension({
    type: 1,
    encode: (_value, buffer) => {
      buffer.writeBin(new Uint8Array(17).fill(123));
    },
    decode: vi.fn(),
  });

  const encoded = encoder.encode({});

  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    flag: Symbols.EXT8,
    startOffset: 0,
    endOffset: 19, // 1 byte for length + 1 byte for extension type + 17 bytes for data
    description: expect.any(String),
    additionalBytes: [
      {
        startOffset: 1,
        endOffset: 1,
      },
      {
        startOffset: 2,
        endOffset: 2,
      },
    ],
    informationBytes: {
      startOffset: 3,
      endOffset: 19,
    },
  });
});

test('ext 16', () => {
  const encoder = new Encoder();
  encoder.addExtension({
    type: 1,
    encode: (_value, buffer) => {
      buffer.writeBin(new Uint8Array(256).fill(123));
    },
    decode: vi.fn(),
  });

  const encoded = encoder.encode({});

  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    flag: Symbols.EXT16,
    startOffset: 0,
    endOffset: 259, // 2 bytes for length + 1 byte for extension type + 256 bytes for data
    description: expect.any(String),
    additionalBytes: [
      {
        startOffset: 1,
        endOffset: 2,
      },
      {
        startOffset: 3,
        endOffset: 3,
      },
    ],
    informationBytes: {
      startOffset: 4,
      endOffset: 259,
    },
  });
});

test('ext 32', () => {
  const requiredSize = 65536 + 1 + 4 + 1; // 1 byte for flag + 4 bytes for length + 1 byte for extension type + 65536 bytes for data

  const encoder = new Encoder({
    initialBufferSize: requiredSize,
    initialSharedBufferSize: requiredSize,
  });

  encoder.addExtension({
    type: 1,
    encode: (_value, buffer) => {
      buffer.writeBin(new Uint8Array(65536).fill(123));
    },
    decode: vi.fn(),
  });

  const encoded = encoder.encode({});

  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    flag: Symbols.EXT32,
    startOffset: 0,
    endOffset: 65541, // 4 bytes for length + 1 byte for extension type + 65536 bytes for data
    description: expect.any(String),
    additionalBytes: [
      {
        startOffset: 1,
        endOffset: 4,
      },
      {
        startOffset: 5,
        endOffset: 5,
      },
    ],
    informationBytes: {
      startOffset: 6,
      endOffset: 65541,
    },
  });
});

test('float 32', () => {
  const encoder = new Encoder({
    forceFloat32: true,
  });
  const encoded = encoder.encode(3.14);
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    flag: Symbols.FLOAT32,
    startOffset: 0,
    endOffset: 4, // float32 has one byte for flag and four bytes for data
    description: expect.any(String),
    informationBytes: {
      startOffset: 1,
      endOffset: 4,
    },
  });
});

test('float 64', () => {
  const encoded = encoder.encode(3.14);
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    flag: Symbols.FLOAT64,
    startOffset: 0,
    endOffset: 8, // float64 has one byte for flag and eight bytes for data
    description: expect.any(String),
    informationBytes: {
      startOffset: 1,
      endOffset: 8,
    },
  });
});

test('uint 8', () => {
  const encoded = encoder.encode(255);
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    flag: Symbols.UINT8,
    startOffset: 0,
    endOffset: 1,
    description: expect.any(String),
    informationBytes: {
      startOffset: 1,
      endOffset: 1,
    },
  });
});

test('uint 16', () => {
  const encoded = encoder.encode(65535);
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    flag: Symbols.UINT16,
    startOffset: 0,
    endOffset: 2, // uint16 has one byte for flag and two bytes for data
    description: expect.any(String),
    informationBytes: {
      startOffset: 1,
      endOffset: 2,
    },
  });
});

test('uint 32', () => {
  const encoded = encoder.encode(65536);
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    flag: Symbols.UINT32,
    startOffset: 0,
    endOffset: 4, // uint32 has one byte for flag and four bytes for data
    description: expect.any(String),
    informationBytes: {
      startOffset: 1,
      endOffset: 4,
    },
  });
});

test('uint 64', () => {
  // JavaScript cannot represent integers larger than Number.MAX_SAFE_INTEGER accurately
  const encoded = encoder.encode(Number.MAX_SAFE_INTEGER);
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    flag: Symbols.UINT64,
    startOffset: 0,
    endOffset: 8, // uint64 has one byte for flag and eight bytes for data
    description: expect.any(String),
    informationBytes: {
      startOffset: 1,
      endOffset: 8,
    },
  });
});

test('int 8', () => {
  const encoded = encoder.encode(-123);
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    flag: Symbols.INT8,
    startOffset: 0,
    endOffset: 1, // int8 has one byte for flag and one byte for data
    description: expect.any(String),
    informationBytes: {
      startOffset: 1,
      endOffset: 1,
    },
  });
});

test('int 16', () => {
  const encoded = encoder.encode(-32768);
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    flag: Symbols.INT16,
    startOffset: 0,
    endOffset: 2, // int16 has one byte for flag and two bytes for data
    description: expect.any(String),
    informationBytes: {
      startOffset: 1,
      endOffset: 2,
    },
  });
});

test('int 32', () => {
  const encoded = encoder.encode(-32769);
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    flag: Symbols.INT32,
    startOffset: 0,
    endOffset: 4, // int32 has one byte for flag and four bytes for data
    description: expect.any(String),
    informationBytes: {
      startOffset: 1,
      endOffset: 4,
    },
  });
});

test('int 64', () => {
  // JavaScript cannot represent integers smaller than Number.MIN_SAFE_INTEGER accurately
  const encoded = encoder.encode(Number.MIN_SAFE_INTEGER);
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    flag: Symbols.INT64,
    startOffset: 0,
    endOffset: 8, // int64 has one byte for flag and eight bytes for data
    description: expect.any(String),
    informationBytes: {
      startOffset: 1,
      endOffset: 8,
    },
  });
});

test('fixext 1', () => {
  const encoder = new Encoder();
  encoder.addExtension({
    type: 1,
    encode: (_value, buffer) => {
      buffer.writeBin(new Uint8Array(1).fill(123));
    },
    decode: vi.fn(),
  });

  const encoded = encoder.encode({});
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    flag: Symbols.FIXEXT1,
    startOffset: 0,
    endOffset: 2, // 1 byte for extension type + 1 byte for data
    description: expect.any(String),
    additionalBytes: [
      {
        startOffset: 1,
        endOffset: 1,
      },
    ],
    informationBytes: {
      startOffset: 2,
      endOffset: 2,
    },
  });
});

test('fixext 2', () => {
  const encoder = new Encoder();
  encoder.addExtension({
    type: 1,
    encode: (_value, buffer) => {
      buffer.writeBin(new Uint8Array(2).fill(123));
    },
    decode: vi.fn(),
  });

  const encoded = encoder.encode({});
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    flag: Symbols.FIXEXT2,
    startOffset: 0,
    endOffset: 3, // 1 byte for extension type + 2 bytes for data
    description: expect.any(String),
    additionalBytes: [
      {
        startOffset: 1,
        endOffset: 1,
      },
    ],
    informationBytes: {
      startOffset: 2,
      endOffset: 3,
    },
  });
});

test('fixext 4', () => {
  const encoder = new Encoder();
  encoder.addExtension({
    type: 1,
    encode: (_value, buffer) => {
      buffer.writeBin(new Uint8Array(4).fill(123));
    },
    decode: vi.fn(),
  });

  const encoded = encoder.encode({});
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    flag: Symbols.FIXEXT4,
    startOffset: 0,
    endOffset: 5, // 1 byte for extension type + 4 bytes for data
    description: expect.any(String),
    additionalBytes: [
      {
        startOffset: 1,
        endOffset: 1,
      },
    ],
    informationBytes: {
      startOffset: 2,
      endOffset: 5,
    },
  });
});

test('fixext 8', () => {
  const encoder = new Encoder();
  encoder.addExtension({
    type: 1,
    encode: (_value, buffer) => {
      buffer.writeBin(new Uint8Array(8).fill(123));
    },
    decode: vi.fn(),
  });

  const encoded = encoder.encode({});
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    flag: Symbols.FIXEXT8,
    startOffset: 0,
    endOffset: 9, // 1 byte for extension type + 8 bytes for data
    description: expect.any(String),
    additionalBytes: [
      {
        startOffset: 1,
        endOffset: 1,
      },
    ],
    informationBytes: {
      startOffset: 2,
      endOffset: 9,
    },
  });
});

test('fixext 16', () => {
  const encoder = new Encoder();
  encoder.addExtension({
    type: 1,
    encode: (_value, buffer) => {
      buffer.writeBin(new Uint8Array(16).fill(123));
    },
    decode: vi.fn(),
  });

  const encoded = encoder.encode({});
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    flag: Symbols.FIXEXT16,
    startOffset: 0,
    endOffset: 17, // 1 byte for extension type + 16 bytes for data
    description: expect.any(String),
    additionalBytes: [
      {
        startOffset: 1,
        endOffset: 1,
      },
    ],
    informationBytes: {
      startOffset: 2,
      endOffset: 17,
    },
  });
});

test('str 8', () => {
  const str = 'a'.repeat(33);
  const encoded = encoder.encode(str);
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    flag: Symbols.STR8,
    startOffset: 0,
    endOffset: 34, // 1 byte for length + 33 bytes for data
    description: expect.any(String),
    additionalBytes: [
      {
        startOffset: 1,
        endOffset: 1,
      },
    ],
    informationBytes: {
      startOffset: 2,
      endOffset: 34,
    },
  });
});

test('str 16', () => {
  const str = 'a'.repeat(256);
  const encoded = encoder.encode(str);
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    flag: Symbols.STR16,
    startOffset: 0,
    endOffset: 258, // 2 bytes for length + 256 bytes for data
    description: expect.any(String),
    additionalBytes: [
      {
        startOffset: 1,
        endOffset: 2,
      },
    ],
    informationBytes: {
      startOffset: 3,
      endOffset: 258,
    },
  });
});

test('str 32', () => {
  const str = 'a'.repeat(65536);
  const encoded = encoder.encode(str);
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    flag: Symbols.STR32,
    startOffset: 0,
    endOffset: encoded.length - 1,
    description: expect.any(String),
    additionalBytes: [
      {
        startOffset: 1,
        endOffset: 4,
      },
    ],
    informationBytes: {
      startOffset: 5,
      endOffset: 65540,
    },
  });
});

test('array 16', () => {
  const array = new Array(16).fill(123);
  const encoded = encoder.encode(array);
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    flag: Symbols.ARRAY16,
    startOffset: 0,
    endOffset: encoded.length - 1,
    description: expect.any(String),
    additionalBytes: [
      {
        startOffset: 1,
        endOffset: 2,
      },
    ],
  });
});

test('array 32', () => {
  const array = new Array(65536).fill(123);
  const encoded = encoder.encode(array);
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    flag: Symbols.ARRAY32,
    startOffset: 0,
    endOffset: encoded.length - 1,
    description: expect.any(String),
    additionalBytes: [
      {
        startOffset: 1,
        endOffset: 4,
      },
    ],
  });
});

test('map 16', () => {
  const map: Record<string, number> = {};
  for (let i = 0; i < 16; i++) {
    map[`key${i}`] = i;
  }

  const encoded = encoder.encode(map);
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    flag: Symbols.MAP16,
    startOffset: 0,
    endOffset: encoded.length - 1,
    description: expect.any(String),
    additionalBytes: [
      {
        startOffset: 1,
        endOffset: 2,
      },
    ],
  });
});

test('map 32', () => {
  const map: Record<string, number> = {};
  for (let i = 0; i < 65536; i++) {
    map[`key${i}`] = i;
  }

  const encoded = encoder.encode(map);
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    flag: Symbols.MAP32,
    startOffset: 0,
    endOffset: encoded.length - 1,
    description: expect.any(String),
    additionalBytes: [
      {
        startOffset: 1,
        endOffset: 4,
      },
    ],
  });
});

test('negative fixint', () => {
  for (let i = -32; i <= -1; i++) {
    const encoded = encoder.encode(i);
    const chunks = serializerDebugger.debug(encoded);

    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toMatchObject({
      flag: Symbols.NEGATIVE_FIXINT_START + (i + 32),
      startOffset: 0,
      endOffset: 0, // negative fixint has only one byte for flag and no additional information
      description: expect.any(String),
    });
  }

  expect.assertions(32 * 2);
});
