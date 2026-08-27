import { Encoder, Symbols } from '@schema-pack/message-pack';
import { expect, test, vi } from 'vitest';

import Debugger from '../../../src/debugger.ts';
import messagePackDebugSymbols from '../../../src/debugSymbols/messagePack.ts';

const serializerDebugger = new Debugger(messagePackDebugSymbols);
const encoder = new Encoder();

test('positive fixint', () => {
  for (
    let index = Symbols.POSITIVE_FIXINT_START;
    index <= Symbols.POSITIVE_FIXINT_END;
    index++
  ) {
    const encoded = encoder.write(index).flush();
    const chunks = serializerDebugger.debug(encoded);

    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toStrictEqual({
      description: expect.any(String),
      endOffset: 0, // fixuint has only one byte for flag and no additional information
      flag: index,
      startOffset: 0,
    });
  }

  expect.assertions(
    (Symbols.POSITIVE_FIXINT_END - Symbols.POSITIVE_FIXINT_START + 1) * 2,
  );
});

test('fixstr', () => {
  for (let index = Symbols.FIXSTR_START; index <= Symbols.FIXSTR_END; index++) {
    const strLength = index - Symbols.FIXSTR_START;
    const str = 'a'.repeat(strLength);

    let expectedEndOffset = 0;
    let expectedStartOffset = 0;

    // oxlint-disable-next-line vitest/no-conditional-in-test
    if (str.length > 0) {
      expectedStartOffset = 1;
      expectedEndOffset = strLength;
    }

    const encoded = encoder.write(str).flush();
    const chunks = serializerDebugger.debug(encoded);

    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toMatchObject({
      description: expect.any(String),
      endOffset: encoded.length - 1,
      flag: index,
      informationBytes: {
        endOffset: expectedEndOffset,
        startOffset: expectedStartOffset,
      },
      startOffset: 0,
    });
  }

  expect.assertions(32 * 2);
});

test('fixmap', () => {
  for (
    let mapIndex = Symbols.FIXMAP_START;
    mapIndex <= Symbols.FIXMAP_END;
    mapIndex++
  ) {
    const mapSize = mapIndex - Symbols.FIXMAP_START;
    const map: Record<string, number> = {};

    for (let index = 0; index < mapSize; index++) {
      map[index] = index;
    }

    const encoded = encoder.write(map).flush();
    const chunks = serializerDebugger.debug(encoded);

    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toMatchObject({
      children: expect.any(Array),
      description: expect.any(String),
      endOffset: encoded.length - 1,
      flag: mapIndex,
      startOffset: 0,
    });
    expect(chunks[0].children).toHaveLength(mapSize * 2);
  }

  expect.assertions(16 * 3);
});

test('fixarray', () => {
  for (
    let itemIndex = Symbols.FIXARRAY_START;
    itemIndex <= Symbols.FIXARRAY_END;
    itemIndex++
  ) {
    const arraySize = itemIndex - Symbols.FIXARRAY_START;

    const array: number[] = [];

    for (let index = 0; index < arraySize; index++) {
      array.push(index);
    }

    const encoded = encoder.write(array).flush();
    const chunks = serializerDebugger.debug(encoded);

    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toMatchObject({
      children: expect.any(Array),
      description: expect.any(String),
      endOffset: encoded.length - 1,
      flag: itemIndex,
      startOffset: 0,
    });
    expect(chunks[0].children).toHaveLength(arraySize);
  }

  expect.assertions(16 * 3);
});

test('nil', () => {
  const encoded = encoder.write(null).flush();
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toStrictEqual({
    description: expect.any(String),
    endOffset: 0, // nil has only one byte for flag and no additional information
    flag: Symbols.NIL,
    startOffset: 0,
  });
});

test('false', () => {
  const encoded = encoder.write(false).flush();
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toStrictEqual({
    description: expect.any(String),
    endOffset: 0, // false has only one byte for flag and no additional information
    flag: Symbols.FALSE,
    startOffset: 0,
  });
});

test('true', () => {
  const encoded = encoder.write(true).flush();
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toStrictEqual({
    description: expect.any(String),
    endOffset: 0, // true has only one byte for flag and no additional information
    flag: Symbols.TRUE,
    startOffset: 0,
  });
});

test('bin8', () => {
  const data = new Uint8Array([1, 2, 3, 4, 5]);
  const encoded = encoder.write(data).flush();
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    additionalBytes: [
      {
        endOffset: 1,
        startOffset: 1,
      },
    ],
    description: expect.any(String),
    endOffset: 6, // bin8 has one byte for flag, one byte for length, and 5 bytes for data
    flag: Symbols.BIN8,
    informationBytes: {
      endOffset: 6,
      startOffset: 2,
    },
    startOffset: 0,
  });
});

test('bin16', () => {
  const data = new Uint8Array(256).fill(42); // 256 bytes of data
  const encoded = encoder.write(data).flush();
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    additionalBytes: [
      {
        endOffset: 2,
        startOffset: 1,
      },
    ],
    description: expect.any(String),
    endOffset: 258, // bin16 has one byte for flag, two bytes for length, and 256 bytes for data
    flag: Symbols.BIN16,
    informationBytes: {
      endOffset: 258,
      startOffset: 3,
    },
    startOffset: 0,
  });
});

test('bin32', () => {
  const data = new Uint8Array(65_536).fill(99); // 65536 bytes of data
  const encoded = encoder.write(data).flush();
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    additionalBytes: [
      {
        endOffset: 4,
        startOffset: 1,
      },
    ],
    description: expect.any(String),
    endOffset: 65_540, // bin32 has one byte for flag, four bytes for length, and 65536 bytes for data
    flag: Symbols.BIN32,
    informationBytes: {
      endOffset: 65_540,
      startOffset: 5,
    },
    startOffset: 0,
  });
});

test('ext 8', () => {
  const encoderWithExtension = new Encoder();
  encoderWithExtension.addExtension({
    decode: vi.fn<() => void>(),
    encode: (_value, buffer) => {
      buffer.writeBin(new Uint8Array(17).fill(123));
    },
    type: 1,
  });

  const encoded = encoderWithExtension.write({}).flush();

  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    additionalBytes: [
      {
        endOffset: 1,
        startOffset: 1,
      },
      {
        endOffset: 2,
        startOffset: 2,
      },
    ],
    description: expect.any(String),
    endOffset: 19, // 1 byte for length + 1 byte for extension type + 17 bytes for data
    flag: Symbols.EXT8,
    informationBytes: {
      endOffset: 19,
      startOffset: 3,
    },
    startOffset: 0,
  });
});

test('ext 16', () => {
  const encoderWithExtension = new Encoder();
  encoderWithExtension.addExtension({
    decode: vi.fn<() => void>(),
    encode: (_value, buffer) => {
      buffer.writeBin(new Uint8Array(256).fill(123));
    },
    type: 1,
  });

  const encoded = encoderWithExtension.write({}).flush();

  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    additionalBytes: [
      {
        endOffset: 2,
        startOffset: 1,
      },
      {
        endOffset: 3,
        startOffset: 3,
      },
    ],
    description: expect.any(String),
    endOffset: 259, // 2 bytes for length + 1 byte for extension type + 256 bytes for data
    flag: Symbols.EXT16,
    informationBytes: {
      endOffset: 259,
      startOffset: 4,
    },
    startOffset: 0,
  });
});

test('ext 32', () => {
  const requiredSize = 65_536 + 1 + 4 + 1; // 1 byte for flag + 4 bytes for length + 1 byte for extension type + 65536 bytes for data

  const encoderWithExtension = new Encoder({
    initialBufferSize: requiredSize,
    initialSharedBufferSize: requiredSize,
  });

  encoderWithExtension.addExtension({
    decode: vi.fn<() => void>(),
    encode: (_value, buffer) => {
      buffer.writeBin(new Uint8Array(65_536).fill(123));
    },
    type: 1,
  });

  const encoded = encoderWithExtension.write({}).flush();

  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    additionalBytes: [
      {
        endOffset: 4,
        startOffset: 1,
      },
      {
        endOffset: 5,
        startOffset: 5,
      },
    ],
    description: expect.any(String),
    endOffset: 65_541, // 4 bytes for length + 1 byte for extension type + 65536 bytes for data
    flag: Symbols.EXT32,
    informationBytes: {
      endOffset: 65_541,
      startOffset: 6,
    },
    startOffset: 0,
  });
});

test('float 32', () => {
  const encoderWithFloat32 = new Encoder({
    forceFloat32: true,
  });
  const encoded = encoderWithFloat32.write(3.14).flush();
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    description: expect.any(String),
    endOffset: 4, // float32 has one byte for flag and four bytes for data
    flag: Symbols.FLOAT32,
    informationBytes: {
      endOffset: 4,
      startOffset: 1,
    },
    startOffset: 0,
  });
});

test('float 64', () => {
  const encoded = encoder.write(3.14).flush();
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    description: expect.any(String),
    endOffset: 8, // float64 has one byte for flag and eight bytes for data
    flag: Symbols.FLOAT64,
    informationBytes: {
      endOffset: 8,
      startOffset: 1,
    },
    startOffset: 0,
  });
});

test('uint 8', () => {
  const encoded = encoder.write(255).flush();
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    description: expect.any(String),
    endOffset: 1,
    flag: Symbols.UINT8,
    informationBytes: {
      endOffset: 1,
      startOffset: 1,
    },
    startOffset: 0,
  });
});

test('uint 16', () => {
  const encoded = encoder.write(65_535).flush();
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    description: expect.any(String),
    endOffset: 2, // uint16 has one byte for flag and two bytes for data
    flag: Symbols.UINT16,
    informationBytes: {
      endOffset: 2,
      startOffset: 1,
    },
    startOffset: 0,
  });
});

test('uint 32', () => {
  const encoded = encoder.write(65_536).flush();
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    description: expect.any(String),
    endOffset: 4, // uint32 has one byte for flag and four bytes for data
    flag: Symbols.UINT32,
    informationBytes: {
      endOffset: 4,
      startOffset: 1,
    },
    startOffset: 0,
  });
});

test('uint 64', () => {
  // JavaScript cannot represent integers larger than Number.MAX_SAFE_INTEGER accurately
  const encoded = encoder.write(Number.MAX_SAFE_INTEGER).flush();
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    description: expect.any(String),
    endOffset: 8, // uint64 has one byte for flag and eight bytes for data
    flag: Symbols.UINT64,
    informationBytes: {
      endOffset: 8,
      startOffset: 1,
    },
    startOffset: 0,
  });
});

test('int 8', () => {
  const encoded = encoder.write(-123).flush();
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    description: expect.any(String),
    endOffset: 1, // int8 has one byte for flag and one byte for data
    flag: Symbols.INT8,
    informationBytes: {
      endOffset: 1,
      startOffset: 1,
    },
    startOffset: 0,
  });
});

test('int 16', () => {
  const encoded = encoder.write(-32_768).flush();
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    description: expect.any(String),
    endOffset: 2, // int16 has one byte for flag and two bytes for data
    flag: Symbols.INT16,
    informationBytes: {
      endOffset: 2,
      startOffset: 1,
    },
    startOffset: 0,
  });
});

test('int 32', () => {
  const encoded = encoder.write(-32_769).flush();
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    description: expect.any(String),
    endOffset: 4, // int32 has one byte for flag and four bytes for data
    flag: Symbols.INT32,
    informationBytes: {
      endOffset: 4,
      startOffset: 1,
    },
    startOffset: 0,
  });
});

test('int 64', () => {
  // JavaScript cannot represent integers smaller than Number.MIN_SAFE_INTEGER accurately
  const encoded = encoder.write(Number.MIN_SAFE_INTEGER).flush();
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    description: expect.any(String),
    endOffset: 8, // int64 has one byte for flag and eight bytes for data
    flag: Symbols.INT64,
    informationBytes: {
      endOffset: 8,
      startOffset: 1,
    },
    startOffset: 0,
  });
});

test('fixext 1', () => {
  const encoderWithExtension = new Encoder();
  encoderWithExtension.addExtension({
    decode: vi.fn<() => void>(),
    encode: (_value, buffer) => {
      buffer.writeBin(new Uint8Array(1).fill(123));
    },
    type: 1,
  });

  const encoded = encoderWithExtension.write({}).flush();
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    additionalBytes: [
      {
        endOffset: 1,
        startOffset: 1,
      },
    ],
    description: expect.any(String),
    endOffset: 2, // 1 byte for extension type + 1 byte for data
    flag: Symbols.FIXEXT1,
    informationBytes: {
      endOffset: 2,
      startOffset: 2,
    },
    startOffset: 0,
  });
});

test('fixext 2', () => {
  const encoderWithExtension = new Encoder();
  encoderWithExtension.addExtension({
    decode: vi.fn<() => void>(),
    encode: (_value, buffer) => {
      buffer.writeBin(new Uint8Array(2).fill(123));
    },
    type: 1,
  });

  const encoded = encoderWithExtension.write({}).flush();
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    additionalBytes: [
      {
        endOffset: 1,
        startOffset: 1,
      },
    ],
    description: expect.any(String),
    endOffset: 3, // 1 byte for extension type + 2 bytes for data
    flag: Symbols.FIXEXT2,
    informationBytes: {
      endOffset: 3,
      startOffset: 2,
    },
    startOffset: 0,
  });
});

test('fixext 4', () => {
  const encoderWithExtension = new Encoder();
  encoderWithExtension.addExtension({
    decode: vi.fn<() => void>(),
    encode: (_value, buffer) => {
      buffer.writeBin(new Uint8Array(4).fill(123));
    },
    type: 1,
  });

  const encoded = encoderWithExtension.write({}).flush();
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    additionalBytes: [
      {
        endOffset: 1,
        startOffset: 1,
      },
    ],
    description: expect.any(String),
    endOffset: 5, // 1 byte for extension type + 4 bytes for data
    flag: Symbols.FIXEXT4,
    informationBytes: {
      endOffset: 5,
      startOffset: 2,
    },
    startOffset: 0,
  });
});

test('fixext 8', () => {
  const encoderWithExtension = new Encoder();
  encoderWithExtension.addExtension({
    decode: vi.fn<() => void>(),
    encode: (_value, buffer) => {
      buffer.writeBin(new Uint8Array(8).fill(123));
    },
    type: 1,
  });

  const encoded = encoderWithExtension.write({}).flush();
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    additionalBytes: [
      {
        endOffset: 1,
        startOffset: 1,
      },
    ],
    description: expect.any(String),
    endOffset: 9, // 1 byte for extension type + 8 bytes for data
    flag: Symbols.FIXEXT8,
    informationBytes: {
      endOffset: 9,
      startOffset: 2,
    },
    startOffset: 0,
  });
});

test('fixext 16', () => {
  const encoderWithExtension = new Encoder();
  encoderWithExtension.addExtension({
    decode: vi.fn<() => void>(),
    encode: (_value, buffer) => {
      buffer.writeBin(new Uint8Array(16).fill(123));
    },
    type: 1,
  });

  const encoded = encoderWithExtension.write({}).flush();
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    additionalBytes: [
      {
        endOffset: 1,
        startOffset: 1,
      },
    ],
    description: expect.any(String),
    endOffset: 17, // 1 byte for extension type + 16 bytes for data
    flag: Symbols.FIXEXT16,
    informationBytes: {
      endOffset: 17,
      startOffset: 2,
    },
    startOffset: 0,
  });
});

test('str 8', () => {
  const str = 'a'.repeat(33);
  const encoded = encoder.write(str).flush();
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    additionalBytes: [
      {
        endOffset: 1,
        startOffset: 1,
      },
    ],
    description: expect.any(String),
    endOffset: 34, // 1 byte for length + 33 bytes for data
    flag: Symbols.STR8,
    informationBytes: {
      endOffset: 34,
      startOffset: 2,
    },
    startOffset: 0,
  });
});

test('str 16', () => {
  const str = 'a'.repeat(256);
  const encoded = encoder.write(str).flush();
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    additionalBytes: [
      {
        endOffset: 2,
        startOffset: 1,
      },
    ],
    description: expect.any(String),
    endOffset: 258, // 2 bytes for length + 256 bytes for data
    flag: Symbols.STR16,
    informationBytes: {
      endOffset: 258,
      startOffset: 3,
    },
    startOffset: 0,
  });
});

test('str 32', () => {
  const str = 'a'.repeat(65_536);
  const encoded = encoder.write(str).flush();
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    additionalBytes: [
      {
        endOffset: 4,
        startOffset: 1,
      },
    ],
    description: expect.any(String),
    endOffset: encoded.length - 1,
    flag: Symbols.STR32,
    informationBytes: {
      endOffset: 65_540,
      startOffset: 5,
    },
    startOffset: 0,
  });
});

test('array 16', () => {
  const array = new Array(16).fill(123);
  const encoded = encoder.write(array).flush();
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    additionalBytes: [
      {
        endOffset: 2,
        startOffset: 1,
      },
    ],
    description: expect.any(String),
    endOffset: encoded.length - 1,
    flag: Symbols.ARRAY16,
    startOffset: 0,
  });
});

test('array 32', () => {
  const array = new Array(65_536).fill(123);
  const encoded = encoder.write(array).flush();
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    additionalBytes: [
      {
        endOffset: 4,
        startOffset: 1,
      },
    ],
    description: expect.any(String),
    endOffset: encoded.length - 1,
    flag: Symbols.ARRAY32,
    startOffset: 0,
  });
});

test('map 16', () => {
  const map: Record<string, number> = {};
  for (let index = 0; index < 16; index++) {
    map[`key${index}`] = index;
  }

  const encoded = encoder.write(map).flush();
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    additionalBytes: [
      {
        endOffset: 2,
        startOffset: 1,
      },
    ],
    description: expect.any(String),
    endOffset: encoded.length - 1,
    flag: Symbols.MAP16,
    startOffset: 0,
  });
});

test('map 32', () => {
  const map: Record<string, number> = {};
  for (let index = 0; index < 65_536; index++) {
    map[`key${index}`] = index;
  }

  const encoded = encoder.write(map).flush();
  const chunks = serializerDebugger.debug(encoded);

  expect(chunks).toHaveLength(1);
  expect(chunks[0]).toMatchObject({
    additionalBytes: [
      {
        endOffset: 4,
        startOffset: 1,
      },
    ],
    description: expect.any(String),
    endOffset: encoded.length - 1,
    flag: Symbols.MAP32,
    startOffset: 0,
  });
});

test('negative fixint', () => {
  for (let index = -32; index <= -1; index++) {
    const encoded = encoder.write(index).flush();
    const chunks = serializerDebugger.debug(encoded);

    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toMatchObject({
      description: expect.any(String),
      endOffset: 0, // negative fixint has only one byte for flag and no additional information
      flag: Symbols.NEGATIVE_FIXINT_START + (index + 32),
      startOffset: 0,
    });
  }

  expect.assertions(32 * 2);
});
