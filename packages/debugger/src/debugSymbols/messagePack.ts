import Symbols from '@schema-pack/message-pack/symbols';

import type Debugger from '../debugger.ts';
import type {
  Chunk,
  DebugSymbolFn,
  DebugSymbols,
  Metadata,
  PartialChunk,
} from '../types.ts';

function debugSingleByte(description: string): DebugSymbolFn {
  return (debug: Debugger) => {
    let descriptionTemplate = description;

    if (description.includes('{FLAG}')) {
      const value = debug.buffer[debug.offset].toString();

      descriptionTemplate = descriptionTemplate.replace('{FLAG}', value);
    }

    return {
      description: descriptionTemplate,
      flag: debug.buffer[debug.offset++],
    };
  };
}

type ReadLengthOutput = Metadata & {
  length: number;
};

function readLength(debug: Debugger, size: 1 | 2 | 4 | 8): ReadLengthOutput {
  let length: number;
  const startOffset = debug.offset;

  switch (size) {
    case 1: {
      length = debug.buffer[debug.offset++];
      break;
    }
    case 2: {
      length = debug.view.getUint16(debug.offset);
      debug.offset += 2;
      break;
    }
    case 4: {
      length = debug.view.getUint32(debug.offset);
      debug.offset += 4;
      break;
    }
    case 8: {
      length = Number(debug.view.getBigUint64(debug.offset));
      debug.offset += 8;
      break;
    }
    default: {
      throw new Error(`Unsupported size: ${size}`);
    }
  }

  const endOffset = debug.offset - 1;

  return {
    description: '',
    endOffset,
    length,
    startOffset,
  };
}

function readInformationBytes(debug: Debugger, length: number): Metadata {
  const startOffset = debug.offset;
  const endOffset = startOffset + length - 1;

  debug.offset = endOffset + 1;

  return {
    description: '',
    endOffset,
    startOffset,
  };
}

function debugFixMap(debug: Debugger): PartialChunk {
  const flag = debug.buffer[debug.offset++];
  // Extract the length from the flag
  const length = flag & 0x0f;

  const items: Chunk[] = [];

  for (let offset = 0; offset < length; offset++) {
    const key = debug.nextValue();
    const value = debug.nextValue();

    items.push(
      {
        ...key,
        description: `Map key: ${key.description}`,
      },
      {
        ...value,
        description: `Map value: ${value.description}`,
      },
    );
  }

  return {
    children: items,
    description: `Message pack fix map flag (${flag - length}) of length ${length}`,
    flag,
  };
}

function debugFixStr(debug: Debugger): PartialChunk {
  const flag = debug.buffer[debug.offset++];
  // Extract the length from the flag
  const length = flag & 0x1f;

  let informationBytes: Metadata;

  if (length > 0) {
    informationBytes = readInformationBytes(debug, length);

    const strBytes = debug.buffer.slice(
      informationBytes.startOffset,
      informationBytes.endOffset + 1,
    );

    informationBytes.description = `"${debug.textDecoder.decode(strBytes)}"`;
  } else {
    const offset = debug.offset - 1;

    informationBytes = {
      description: 'Empty string',
      endOffset: offset,
      startOffset: offset,
    };
  }

  return {
    description: `Message pack fix string flag (${flag - length}) of length ${length}`,
    flag,
    informationBytes,
  };
}

function debugFixArray(debug: Debugger): PartialChunk {
  const flag = debug.buffer[debug.offset++];
  const length = flag & 0x0f;

  const children: Chunk[] = [];

  for (let offset = 0; offset < length; offset++) {
    const value = debug.nextValue();

    children.push({
      ...value,
      description: `Array element in index ${offset}: ${value.description}`,
    });
  }

  return {
    children,
    description: `Message pack fix array flag (${flag - length}) of length ${length}`,
    flag,
  };
}

/** DEBUGGERS. */
function debugBin8(debug: Debugger): PartialChunk {
  const flag = debug.buffer[debug.offset++];

  const { length, ...additionalBytes } = readLength(debug, 1);

  additionalBytes.description = `8 bits length of the binary data: ${length}`;

  const informationBytes = readInformationBytes(debug, length);

  informationBytes.description = `Binary data of length ${length}`;

  return {
    additionalBytes: [additionalBytes],
    description: `Message pack bin8 flag (${flag})`,
    flag,
    informationBytes,
  };
}

function debugBin16(debug: Debugger): PartialChunk {
  const flag = debug.buffer[debug.offset++];
  const { length, ...additionalBytes } = readLength(debug, 2);

  additionalBytes.description = `16 bits length of the binary data: ${length}`;

  const informationBytes = readInformationBytes(debug, length);

  informationBytes.description = `Binary data of length ${length}`;

  return {
    additionalBytes: [additionalBytes],
    description: `Message pack bin16 flag (${flag})`,
    flag,
    informationBytes,
  };
}

function debugBin32(debug: Debugger): PartialChunk {
  const flag = debug.buffer[debug.offset++];
  const { length, ...additionalBytes } = readLength(debug, 4);

  additionalBytes.description = `32 bits length of the binary data: ${length}`;

  const informationBytes = readInformationBytes(debug, length);

  informationBytes.description = `Binary data of length ${length}`;

  return {
    additionalBytes: [additionalBytes],
    description: `Message pack bin32 flag (${flag})`,
    flag,
    informationBytes,
  };
}

function debugExt8(debug: Debugger): PartialChunk {
  const flag = debug.buffer[debug.offset++];
  const { length, ...lengthBytes } = readLength(debug, 1);

  lengthBytes.description = `8 bits length of the extension data: ${length}`;

  const extensionTypeBytes = readInformationBytes(debug, 1);

  extensionTypeBytes.description = `Extension type: ${debug.buffer[extensionTypeBytes.startOffset]}`;

  const informationBytes = readInformationBytes(debug, length);

  informationBytes.description = `Extension data of length ${length}`;

  return {
    additionalBytes: [lengthBytes, extensionTypeBytes],
    description: `Message pack fixext8 flag (${flag})`,
    flag,
    informationBytes,
  };
}

function debugExt16(debug: Debugger): PartialChunk {
  const flag = debug.buffer[debug.offset++];
  const { length, ...lengthBytes } = readLength(debug, 2);

  lengthBytes.description = `16 bits length of the extension data: ${length}`;

  const extensionTypeBytes = readInformationBytes(debug, 1);

  extensionTypeBytes.description = `Extension type: ${debug.buffer[extensionTypeBytes.startOffset]}`;

  const informationBytes = readInformationBytes(debug, length);

  informationBytes.description = `Extension data of length ${length}`;

  return {
    additionalBytes: [lengthBytes, extensionTypeBytes],
    description: `Message pack fixext16 flag (${flag})`,
    flag,
    informationBytes,
  };
}

function debugExt32(debug: Debugger): PartialChunk {
  const flag = debug.buffer[debug.offset++];
  const { length, ...lengthBytes } = readLength(debug, 4);

  lengthBytes.description = `32 bits length of the extension data: ${length}`;

  const extensionTypeBytes = readInformationBytes(debug, 1);

  extensionTypeBytes.description = `Extension type: ${debug.buffer[extensionTypeBytes.startOffset]}`;

  const informationBytes = readInformationBytes(debug, length);

  informationBytes.description = `Extension data of length ${length}`;

  return {
    additionalBytes: [lengthBytes, extensionTypeBytes],
    description: `Message pack fixext32 flag (${flag})`,
    flag,
    informationBytes,
  };
}

function debugFloat32(debug: Debugger): PartialChunk {
  const flag = debug.buffer[debug.offset++];
  const value = debug.view.getFloat32(debug.offset);
  const informationBytes = readInformationBytes(debug, 4);

  informationBytes.description = `Float32 value: ${value}`;

  return {
    description: `Message pack float32 flag (${flag})`,
    flag,
    informationBytes,
    warning:
      "JavaScript uses 64-bit floating point numbers, so the original float32 value may not be represented exactly. This is a limitation of JavaScript's number representation.",
  };
}

function debugFloat64(debug: Debugger): PartialChunk {
  const flag = debug.buffer[debug.offset++];
  const value = debug.view.getFloat64(debug.offset);
  const informationBytes = readInformationBytes(debug, 8);

  informationBytes.description = `Float64 value: ${value}`;

  return {
    description: `Message pack float64 flag (${flag})`,
    flag,
    informationBytes,
  };
}

function debugUint8(debug: Debugger): PartialChunk {
  const flag = debug.buffer[debug.offset++];
  const value = debug.view.getUint8(debug.offset);
  const informationBytes = readInformationBytes(debug, 1);

  informationBytes.description = `Uint8 value: ${value}`;

  return {
    description: `Message pack uint8 flag (${flag})`,
    flag,
    informationBytes,
  };
}

function debugUint16(debug: Debugger): PartialChunk {
  const flag = debug.buffer[debug.offset++];
  const value = debug.view.getUint16(debug.offset);
  const informationBytes = readInformationBytes(debug, 2);

  informationBytes.description = `Uint16 value: ${value}`;

  return {
    description: `Message pack uint16 flag (${flag})`,
    flag,
    informationBytes,
  };
}

function debugUint32(debug: Debugger): PartialChunk {
  const flag = debug.buffer[debug.offset++];
  const value = debug.view.getUint32(debug.offset);
  const informationBytes = readInformationBytes(debug, 4);

  informationBytes.description = `Uint32 value: ${value}`;

  return {
    description: `Message pack uint32 flag (${flag})`,
    flag,
    informationBytes,
  };
}

function debugUint64(debug: Debugger): PartialChunk {
  const flag = debug.buffer[debug.offset++];
  const value = debug.view.getBigUint64(debug.offset);
  const informationBytes = readInformationBytes(debug, 8);

  informationBytes.description = `Uint64 value: ${value}`;

  return {
    description: `Message pack uint64 flag (${flag})`,
    flag,
    informationBytes,
    // warning: "JavaScript cannot represent integers larger than Number.MAX_SAFE_INTEGER (2^53 - 1) accurately. The original uint64 value may not be represented exactly. This is a limitation of JavaScript's number representation.",
  };
}

function debugInt8(debug: Debugger): PartialChunk {
  const flag = debug.buffer[debug.offset++];
  const value = debug.view.getInt8(debug.offset);
  const informationBytes = readInformationBytes(debug, 1);

  informationBytes.description = `Int8 value: ${value}`;

  return {
    description: `Message pack int8 flag (${flag})`,
    flag,
    informationBytes,
  };
}

function debugInt16(debug: Debugger): PartialChunk {
  const flag = debug.buffer[debug.offset++];
  const value = debug.view.getInt16(debug.offset);
  const informationBytes = readInformationBytes(debug, 2);

  informationBytes.description = `Int16 value: ${value}`;

  return {
    description: `Message pack int16 flag (${flag})`,
    flag,
    informationBytes,
  };
}

function debugInt32(debug: Debugger): PartialChunk {
  const flag = debug.buffer[debug.offset++];
  const value = debug.view.getInt32(debug.offset);
  const informationBytes = readInformationBytes(debug, 4);

  informationBytes.description = `Int32 value: ${value}`;

  return {
    description: `Message pack int32 flag (${flag})`,
    flag,
    informationBytes,
  };
}

function debugInt64(debug: Debugger): PartialChunk {
  const flag = debug.buffer[debug.offset++];
  const value = debug.view.getBigInt64(debug.offset);
  const informationBytes = readInformationBytes(debug, 8);

  informationBytes.description = `Int64 value: ${value}`;

  return {
    description: `Message pack int64 flag (${flag})`,
    flag,
    informationBytes,
    // warning: "JavaScript cannot represent integers larger than Number.MAX_SAFE_INTEGER (2^53 - 1) accurately. The original int64 value may not be represented exactly. This is a limitation of JavaScript's number representation.",
  };
}

function debugFixExt1(debug: Debugger): PartialChunk {
  const flag = debug.buffer[debug.offset++];
  const extensionTypeBytes = readInformationBytes(debug, 1);
  const informationBytes = readInformationBytes(debug, 1);

  extensionTypeBytes.description = `Extension type: ${debug.buffer[extensionTypeBytes.startOffset]}`;
  informationBytes.description = `Extension binary data of length 1`;

  return {
    additionalBytes: [extensionTypeBytes],
    description: `Message pack fixext1 flag (${flag})`,
    flag,
    informationBytes,
  };
}

function debugFixExt2(debug: Debugger): PartialChunk {
  const flag = debug.buffer[debug.offset++];
  const extensionTypeBytes = readInformationBytes(debug, 1);
  const informationBytes = readInformationBytes(debug, 2);

  extensionTypeBytes.description = `Extension type: ${debug.buffer[extensionTypeBytes.startOffset]}`;
  informationBytes.description = `Extension binary data of length 2`;

  return {
    additionalBytes: [extensionTypeBytes],
    description: `Message pack fixext2 flag (${flag})`,
    flag,
    informationBytes,
  };
}

function debugFixExt4(debug: Debugger): PartialChunk {
  const flag = debug.buffer[debug.offset++];
  const extensionTypeBytes = readInformationBytes(debug, 1);
  const informationBytes = readInformationBytes(debug, 4);

  extensionTypeBytes.description = `Extension type: ${debug.buffer[extensionTypeBytes.startOffset]}`;
  informationBytes.description = `Extension binary data of length 4`;

  return {
    additionalBytes: [extensionTypeBytes],
    description: `Message pack fixext4 flag (${flag})`,
    flag,
    informationBytes,
  };
}

function debugFixExt8(debug: Debugger): PartialChunk {
  const flag = debug.buffer[debug.offset++];
  const extensionTypeBytes = readInformationBytes(debug, 1);
  const informationBytes = readInformationBytes(debug, 8);

  extensionTypeBytes.description = `Extension type: ${debug.buffer[extensionTypeBytes.startOffset]}`;
  informationBytes.description = `Extension binary data of length 8`;

  return {
    additionalBytes: [extensionTypeBytes],
    description: `Message pack fixext8 flag (${flag})`,
    flag,
    informationBytes,
  };
}

function debugFixExt16(debug: Debugger): PartialChunk {
  const flag = debug.buffer[debug.offset++];
  const extensionTypeBytes = readInformationBytes(debug, 1);
  const informationBytes = readInformationBytes(debug, 16);

  extensionTypeBytes.description = `Extension type: ${debug.buffer[extensionTypeBytes.startOffset]}`;
  informationBytes.description = `Extension binary data of length 16`;

  return {
    additionalBytes: [extensionTypeBytes],
    description: `Message pack fixext16 flag (${flag})`,
    flag,
    informationBytes,
  };
}

function debugStr8(debug: Debugger): PartialChunk {
  const flag = debug.buffer[debug.offset++];
  const { length, ...additionalBytes } = readLength(debug, 1);
  const informationBytes = readInformationBytes(debug, length);
  const strBytes = debug.buffer.slice(
    informationBytes.startOffset,
    informationBytes.endOffset + 1,
  );

  additionalBytes.description = `8 bits length of the string: ${length}`;
  informationBytes.description = `"${debug.textDecoder.decode(strBytes)}"`;

  return {
    additionalBytes: [additionalBytes],
    description: `Message pack str8 of length ${length}`,
    flag,
    informationBytes,
  };
}

function debugStr16(debug: Debugger): PartialChunk {
  const flag = debug.buffer[debug.offset++];
  const { length, ...additionalBytes } = readLength(debug, 2);
  const informationBytes = readInformationBytes(debug, length);
  const strBytes = debug.buffer.slice(
    informationBytes.startOffset,
    informationBytes.endOffset + 1,
  );

  additionalBytes.description = `16 bits length of the string: ${length}`;
  informationBytes.description = `"${debug.textDecoder.decode(strBytes)}"`;

  return {
    additionalBytes: [additionalBytes],
    description: `Message pack str16 of length ${length}`,
    flag,
    informationBytes,
  };
}

function debugStr32(debug: Debugger): PartialChunk {
  const flag = debug.buffer[debug.offset++];
  const { length, ...additionalBytes } = readLength(debug, 4);
  const informationBytes = readInformationBytes(debug, length);
  const strBytes = debug.buffer.slice(
    informationBytes.startOffset,
    informationBytes.endOffset + 1,
  );

  additionalBytes.description = `32 bits length of the string: ${length}`;
  informationBytes.description = `"${debug.textDecoder.decode(strBytes)}"`;

  return {
    additionalBytes: [additionalBytes],
    description: `Message pack str32 flag (${flag})`,
    flag,
    informationBytes,
  };
}

function debugArray16(debug: Debugger): PartialChunk {
  const flag = debug.buffer[debug.offset++];
  const { length, ...additionalBytes } = readLength(debug, 2);

  additionalBytes.description = `16 bits length of the array: ${length}`;

  const children: Chunk[] = [];

  for (let offset = 0; offset < length; offset++) {
    const value = debug.nextValue();

    children.push({
      ...value,
      description: `Array element in index ${offset}: ${value.description}`,
    });
  }

  return {
    additionalBytes: [additionalBytes],
    children,
    description: `Message pack array16 flag (${flag})`,
    flag,
  };
}

function debugArray32(debug: Debugger): PartialChunk {
  const flag = debug.buffer[debug.offset++];
  const { length, ...additionalBytes } = readLength(debug, 4);

  additionalBytes.description = `32 bits length of the array: ${length}`;

  const children: Chunk[] = [];

  for (let offset = 0; offset < length; offset++) {
    const value = debug.nextValue();

    children.push({
      ...value,
      description: `Array element in index ${offset}: ${value.description}`,
    });
  }

  return {
    additionalBytes: [additionalBytes],
    children,
    description: `Message pack array32 flag (${flag})`,
    flag,
  };
}

function debugMap16(debug: Debugger): PartialChunk {
  const flag = debug.buffer[debug.offset++];
  const { length, ...additionalBytes } = readLength(debug, 2);

  additionalBytes.description = `16 bits length of the map: ${length}`;

  const children: Chunk[] = [];

  for (let offset = 0; offset < length; offset++) {
    const key = debug.nextValue();
    const value = debug.nextValue();

    children.push(
      {
        ...key,
        description: `Map key in index ${offset}: ${key.description}`,
      },
      {
        ...value,
        description: `Map value in index ${offset}: ${value.description}`,
      },
    );
  }

  return {
    additionalBytes: [additionalBytes],
    children,
    description: `Message pack map16 flag (${flag})`,
    flag,
  };
}

function debugMap32(debug: Debugger): PartialChunk {
  const flag = debug.buffer[debug.offset++];
  const { length, ...additionalBytes } = readLength(debug, 4);

  additionalBytes.description = `32 bits length of the map: ${length}`;

  const children: Chunk[] = [];

  for (let offset = 0; offset < length; offset++) {
    const key = debug.nextValue();
    const value = debug.nextValue();

    children.push(
      {
        ...key,
        description: `Map key in index ${offset}: ${key.description}`,
      },
      {
        ...value,
        description: `Map value in index ${offset}: ${value.description}`,
      },
    );
  }

  return {
    additionalBytes: [additionalBytes],
    children,
    description: `Message pack map32 flag (${flag})`,
    flag,
  };
}

function debugNegativeFixInt(debug: Debugger): PartialChunk {
  const flag = debug.buffer[debug.offset++];
  // Extract the value from the flag
  const value = (flag & 0x1f) - 32;

  return {
    description: `Message pack fix negative int flag ${flag} with value ${value}`,
    flag,
  };
}

const messagePackDebugSymbols: DebugSymbols = {
  [Symbols.NIL]: debugSingleByte('Message pack nil'),
  [Symbols.FALSE]: debugSingleByte('Message pack false'),
  [Symbols.TRUE]: debugSingleByte('Message pack true'),
  [Symbols.BIN8]: debugBin8,
  [Symbols.BIN16]: debugBin16,
  [Symbols.BIN32]: debugBin32,
  [Symbols.EXT8]: debugExt8,
  [Symbols.EXT16]: debugExt16,
  [Symbols.EXT32]: debugExt32,
  [Symbols.FLOAT32]: debugFloat32,
  [Symbols.FLOAT64]: debugFloat64,
  [Symbols.UINT8]: debugUint8,
  [Symbols.UINT16]: debugUint16,
  [Symbols.UINT32]: debugUint32,
  [Symbols.UINT64]: debugUint64,
  [Symbols.INT8]: debugInt8,
  [Symbols.INT16]: debugInt16,
  [Symbols.INT32]: debugInt32,
  [Symbols.INT64]: debugInt64,
  [Symbols.FIXEXT1]: debugFixExt1,
  [Symbols.FIXEXT2]: debugFixExt2,
  [Symbols.FIXEXT4]: debugFixExt4,
  [Symbols.FIXEXT8]: debugFixExt8,
  [Symbols.FIXEXT16]: debugFixExt16,
  [Symbols.STR8]: debugStr8,
  [Symbols.STR16]: debugStr16,
  [Symbols.STR32]: debugStr32,
  [Symbols.ARRAY16]: debugArray16,
  [Symbols.ARRAY32]: debugArray32,
  [Symbols.MAP16]: debugMap16,
  [Symbols.MAP32]: debugMap32,
  [Symbols.NEVER_USED]: debugSingleByte('Message pack never used'),
};

for (let index = 0; index <= 127; index++) {
  messagePackDebugSymbols[index] = debugSingleByte(
    `Message pack fix positive int: {FLAG}`,
  );
}

for (let index = 128; index <= 143; index++) {
  messagePackDebugSymbols[index] = debugFixMap;
}

for (let index = 144; index <= 159; index++) {
  messagePackDebugSymbols[index] = debugFixArray;
}

for (let index = 160; index <= 191; index++) {
  messagePackDebugSymbols[index] = debugFixStr;
}

for (let index = 224; index <= 255; index++) {
  messagePackDebugSymbols[index] = debugNegativeFixInt;
}

export default messagePackDebugSymbols;
