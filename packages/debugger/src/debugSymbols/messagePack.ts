import { Symbols } from '@schema-pack/message-pack';
import type { Chunk, DebugSymbolFn, DebugSymbols, Metadata } from '../types.ts';
import type Debugger from '../debugger.ts';

const debugSingleByte: (description: string) => DebugSymbolFn = (
  description,
) => {
  return (debug: Debugger) => {
    if (description.includes('{FLAG}')) {
      const value = debug.buffer[debug.offset].toString();

      description = description.replace('{FLAG}', value);
    }

    return {
      flag: debug.buffer[debug.offset++],
      description,
    };
  };
};

type ReadLengthOutput = Metadata & {
  length: number;
};

function readLength(debug: Debugger, size: 1 | 2 | 4 | 8): ReadLengthOutput {
  let length: number;
  const startOffset = debug.offset;

  switch (size) {
    case 1:
      length = debug.buffer[debug.offset++];
      break;
    case 2:
      length = debug.view.getUint16(debug.offset);
      debug.offset += 2;
      break;
    case 4:
      length = debug.view.getUint32(debug.offset);
      debug.offset += 4;
      break;
    case 8:
      length = Number(debug.view.getBigUint64(debug.offset));
      debug.offset += 8;
      break;
    default:
      throw new Error(`Unsupported size: ${size}`);
  }

  const endOffset = debug.offset - 1;

  return {
    length,
    startOffset,
    endOffset,
    description: '',
  };
}

function readInformationBytes(debug: Debugger, length: number): Metadata {
  const startOffset = debug.offset;
  const endOffset = startOffset + length - 1;

  debug.offset = endOffset + 1;

  return {
    startOffset,
    endOffset,
    description: '',
  };
}

const debugFixMap: DebugSymbolFn = (debug) => {
  const flag = debug.buffer[debug.offset++];
  const length = flag & 0x0f; // Extract the length from the flag

  const items: Chunk[] = [];

  for (let i = 0; i < length; i++) {
    const key = debug.nextValue();
    const value = debug.nextValue();

    items.push({
      ...key,
      description: `Map key: ${key.description}`,
    });

    items.push({
      ...value,
      description: `Map value: ${value.description}`,
    });
  }

  return {
    flag,
    description: `Message pack fix map flag (${flag - length}) of length ${length}`,
    children: items,
  };
};

const debugFixStr: DebugSymbolFn = (debug) => {
  const flag = debug.buffer[debug.offset++];
  const length = flag & 0x1f; // Extract the length from the flag

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
      startOffset: offset,
      endOffset: offset,
      description: 'Empty string',
    };
  }

  return {
    flag,
    description: `Message pack fix string flag (${flag - length}) of length ${length}`,
    informationBytes,
  };
};

const debugFixArray: DebugSymbolFn = (debug) => {
  const flag = debug.buffer[debug.offset++];
  const length = flag & 0x0f;

  const children: Chunk[] = [];

  for (let i = 0; i < length; i++) {
    const value = debug.nextValue();

    children.push({
      ...value,
      description: `Array element in index ${i}: ${value.description}`,
    });
  }

  return {
    flag,
    description: `Message pack fix array flag (${flag - length}) of length ${length}`,
    children,
  };
};

/**
 * DEBUGGERS
 */
const debugBin8: DebugSymbolFn = (debug) => {
  const flag = debug.buffer[debug.offset++];

  const { length, ...additionalBytes } = readLength(debug, 1);

  additionalBytes.description = `8 bits length of the binary data: ${length}`;

  const informationBytes = readInformationBytes(debug, length);

  informationBytes.description = `Binary data of length ${length}`;

  return {
    flag,
    description: `Message pack bin8 flag (${flag})`,
    additionalBytes: [additionalBytes],
    informationBytes,
  };
};

const debugBin16: DebugSymbolFn = (debug) => {
  const flag = debug.buffer[debug.offset++];
  const { length, ...additionalBytes } = readLength(debug, 2);

  additionalBytes.description = `16 bits length of the binary data: ${length}`;

  const informationBytes = readInformationBytes(debug, length);

  informationBytes.description = `Binary data of length ${length}`;

  return {
    flag,
    description: `Message pack bin16 flag (${flag})`,
    additionalBytes: [additionalBytes],
    informationBytes,
  };
};

const debugBin32: DebugSymbolFn = (debug) => {
  const flag = debug.buffer[debug.offset++];
  const { length, ...additionalBytes } = readLength(debug, 4);

  additionalBytes.description = `32 bits length of the binary data: ${length}`;

  const informationBytes = readInformationBytes(debug, length);

  informationBytes.description = `Binary data of length ${length}`;

  return {
    flag,
    description: `Message pack bin32 flag (${flag})`,
    additionalBytes: [additionalBytes],
    informationBytes,
  };
};

const debugExt8: DebugSymbolFn = (debug) => {
  const flag = debug.buffer[debug.offset++];
  const { length, ...lengthBytes } = readLength(debug, 1);

  lengthBytes.description = `8 bits length of the extension data: ${length}`;

  const extensionTypeBytes = readInformationBytes(debug, 1);

  extensionTypeBytes.description = `Extension type: ${debug.buffer[extensionTypeBytes.startOffset]}`;

  const informationBytes = readInformationBytes(debug, length);

  informationBytes.description = `Extension data of length ${length}`;

  return {
    flag,
    description: `Message pack fixext8 flag (${flag})`,
    additionalBytes: [lengthBytes, extensionTypeBytes],
    informationBytes,
  };
};

const debugExt16: DebugSymbolFn = (debug) => {
  const flag = debug.buffer[debug.offset++];
  const { length, ...lengthBytes } = readLength(debug, 2);

  lengthBytes.description = `16 bits length of the extension data: ${length}`;

  const extensionTypeBytes = readInformationBytes(debug, 1);

  extensionTypeBytes.description = `Extension type: ${debug.buffer[extensionTypeBytes.startOffset]}`;

  const informationBytes = readInformationBytes(debug, length);

  informationBytes.description = `Extension data of length ${length}`;

  return {
    flag,
    description: `Message pack fixext16 flag (${flag})`,
    additionalBytes: [lengthBytes, extensionTypeBytes],
    informationBytes,
  };
};

const debugExt32: DebugSymbolFn = (debug) => {
  const flag = debug.buffer[debug.offset++];
  const { length, ...lengthBytes } = readLength(debug, 4);

  lengthBytes.description = `32 bits length of the extension data: ${length}`;

  const extensionTypeBytes = readInformationBytes(debug, 1);

  extensionTypeBytes.description = `Extension type: ${debug.buffer[extensionTypeBytes.startOffset]}`;

  const informationBytes = readInformationBytes(debug, length);

  informationBytes.description = `Extension data of length ${length}`;

  return {
    flag,
    description: `Message pack fixext32 flag (${flag})`,
    additionalBytes: [lengthBytes, extensionTypeBytes],
    informationBytes,
  };
};

const debugFloat32: DebugSymbolFn = (debug) => {
  const flag = debug.buffer[debug.offset++];
  const value = debug.view.getFloat32(debug.offset);
  const informationBytes = readInformationBytes(debug, 4);

  informationBytes.description = `Float32 value: ${value}`;

  return {
    flag,
    description: `Message pack float32 flag (${flag})`,
    informationBytes: informationBytes,
    warning:
      "JavaScript uses 64-bit floating point numbers, so the original float32 value may not be represented exactly. This is a limitation of JavaScript's number representation.",
  };
};

const debugFloat64: DebugSymbolFn = (debug) => {
  const flag = debug.buffer[debug.offset++];
  const value = debug.view.getFloat64(debug.offset);
  const informationBytes = readInformationBytes(debug, 8);

  informationBytes.description = `Float64 value: ${value}`;

  return {
    flag,
    description: `Message pack float64 flag (${flag})`,
    informationBytes: informationBytes,
  };
};

const debugUint8: DebugSymbolFn = (debug) => {
  const flag = debug.buffer[debug.offset++];
  const value = debug.view.getUint8(debug.offset);
  const informationBytes = readInformationBytes(debug, 1);

  informationBytes.description = `Uint8 value: ${value}`;

  return {
    flag,
    description: `Message pack uint8 flag (${flag})`,
    informationBytes: informationBytes,
  };
};

const debugUint16: DebugSymbolFn = (debug) => {
  const flag = debug.buffer[debug.offset++];
  const value = debug.view.getUint16(debug.offset);
  const informationBytes = readInformationBytes(debug, 2);

  informationBytes.description = `Uint16 value: ${value}`;

  return {
    flag,
    description: `Message pack uint16 flag (${flag})`,
    informationBytes: informationBytes,
  };
};

const debugUint32: DebugSymbolFn = (debug) => {
  const flag = debug.buffer[debug.offset++];
  const value = debug.view.getUint32(debug.offset);
  const informationBytes = readInformationBytes(debug, 4);

  informationBytes.description = `Uint32 value: ${value}`;

  return {
    flag,
    description: `Message pack uint32 flag (${flag})`,
    informationBytes: informationBytes,
  };
};

const debugUint64: DebugSymbolFn = (debug) => {
  const flag = debug.buffer[debug.offset++];
  const value = debug.view.getBigUint64(debug.offset);
  const informationBytes = readInformationBytes(debug, 8);

  informationBytes.description = `Uint64 value: ${value}`;

  return {
    flag,
    description: `Message pack uint64 flag (${flag})`,
    informationBytes: informationBytes,
    // warning: "JavaScript cannot represent integers larger than Number.MAX_SAFE_INTEGER (2^53 - 1) accurately. The original uint64 value may not be represented exactly. This is a limitation of JavaScript's number representation.",
  };
};

const debugInt8: DebugSymbolFn = (debug) => {
  const flag = debug.buffer[debug.offset++];
  const value = debug.view.getInt8(debug.offset);
  const informationBytes = readInformationBytes(debug, 1);

  informationBytes.description = `Int8 value: ${value}`;

  return {
    flag,
    description: `Message pack int8 flag (${flag})`,
    informationBytes: informationBytes,
  };
};

const debugInt16: DebugSymbolFn = (debug) => {
  const flag = debug.buffer[debug.offset++];
  const value = debug.view.getInt16(debug.offset);
  const informationBytes = readInformationBytes(debug, 2);

  informationBytes.description = `Int16 value: ${value}`;

  return {
    flag,
    description: `Message pack int16 flag (${flag})`,
    informationBytes: informationBytes,
  };
};

const debugInt32: DebugSymbolFn = (debug) => {
  const flag = debug.buffer[debug.offset++];
  const value = debug.view.getInt32(debug.offset);
  const informationBytes = readInformationBytes(debug, 4);

  informationBytes.description = `Int32 value: ${value}`;

  return {
    flag,
    description: `Message pack int32 flag (${flag})`,
    informationBytes: informationBytes,
  };
};

const debugInt64: DebugSymbolFn = (debug) => {
  const flag = debug.buffer[debug.offset++];
  const value = debug.view.getBigInt64(debug.offset);
  const informationBytes = readInformationBytes(debug, 8);

  informationBytes.description = `Int64 value: ${value}`;

  return {
    flag,
    description: `Message pack int64 flag (${flag})`,
    informationBytes: informationBytes,
    // warning: "JavaScript cannot represent integers larger than Number.MAX_SAFE_INTEGER (2^53 - 1) accurately. The original int64 value may not be represented exactly. This is a limitation of JavaScript's number representation.",
  };
};

const debugFixExt1: DebugSymbolFn = (debug) => {
  const flag = debug.buffer[debug.offset++];
  const extensionTypeBytes = readInformationBytes(debug, 1);
  const informationBytes = readInformationBytes(debug, 1);

  extensionTypeBytes.description = `Extension type: ${debug.buffer[extensionTypeBytes.startOffset]}`;
  informationBytes.description = `Extension binary data of length 1`;

  return {
    flag,
    description: `Message pack fixext1 flag (${flag})`,
    additionalBytes: [extensionTypeBytes],
    informationBytes: informationBytes,
  };
};

const debugFixExt2: DebugSymbolFn = (debug) => {
  const flag = debug.buffer[debug.offset++];
  const extensionTypeBytes = readInformationBytes(debug, 1);
  const informationBytes = readInformationBytes(debug, 2);

  extensionTypeBytes.description = `Extension type: ${debug.buffer[extensionTypeBytes.startOffset]}`;
  informationBytes.description = `Extension binary data of length 2`;

  return {
    flag,
    description: `Message pack fixext2 flag (${flag})`,
    additionalBytes: [extensionTypeBytes],
    informationBytes: informationBytes,
  };
};

const debugFixExt4: DebugSymbolFn = (debug) => {
  const flag = debug.buffer[debug.offset++];
  const extensionTypeBytes = readInformationBytes(debug, 1);
  const informationBytes = readInformationBytes(debug, 4);

  extensionTypeBytes.description = `Extension type: ${debug.buffer[extensionTypeBytes.startOffset]}`;
  informationBytes.description = `Extension binary data of length 4`;

  return {
    flag,
    description: `Message pack fixext4 flag (${flag})`,
    additionalBytes: [extensionTypeBytes],
    informationBytes: informationBytes,
  };
};

const debugFixExt8: DebugSymbolFn = (debug) => {
  const flag = debug.buffer[debug.offset++];
  const extensionTypeBytes = readInformationBytes(debug, 1);
  const informationBytes = readInformationBytes(debug, 8);

  extensionTypeBytes.description = `Extension type: ${debug.buffer[extensionTypeBytes.startOffset]}`;
  informationBytes.description = `Extension binary data of length 8`;

  return {
    flag,
    description: `Message pack fixext8 flag (${flag})`,
    additionalBytes: [extensionTypeBytes],
    informationBytes: informationBytes,
  };
};

const debugFixExt16: DebugSymbolFn = (debug) => {
  const flag = debug.buffer[debug.offset++];
  const extensionTypeBytes = readInformationBytes(debug, 1);
  const informationBytes = readInformationBytes(debug, 16);

  extensionTypeBytes.description = `Extension type: ${debug.buffer[extensionTypeBytes.startOffset]}`;
  informationBytes.description = `Extension binary data of length 16`;

  return {
    flag,
    description: `Message pack fixext16 flag (${flag})`,
    additionalBytes: [extensionTypeBytes],
    informationBytes: informationBytes,
  };
};

const debugStr8: DebugSymbolFn = (debug) => {
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
    flag,
    description: `Message pack str8 of length ${length}`,
    additionalBytes: [additionalBytes],
    informationBytes,
  };
};

const debugStr16: DebugSymbolFn = (debug) => {
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
    flag,
    description: `Message pack str16 of length ${length}`,
    additionalBytes: [additionalBytes],
    informationBytes,
  };
};

const debugStr32: DebugSymbolFn = (debug) => {
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
    flag,
    description: `Message pack str32 flag (${flag})`,
    additionalBytes: [additionalBytes],
    informationBytes,
  };
};

const debugArray16: DebugSymbolFn = (debug) => {
  const flag = debug.buffer[debug.offset++];
  const { length, ...additionalBytes } = readLength(debug, 2);

  additionalBytes.description = `16 bits length of the array: ${length}`;

  const children: Chunk[] = [];

  for (let i = 0; i < length; i++) {
    const value = debug.nextValue();

    children.push({
      ...value,
      description: `Array element in index ${i}: ${value.description}`,
    });
  }

  return {
    flag,
    description: `Message pack array16 flag (${flag})`,
    additionalBytes: [additionalBytes],
    children,
  };
};

const debugArray32: DebugSymbolFn = (debug) => {
  const flag = debug.buffer[debug.offset++];
  const { length, ...additionalBytes } = readLength(debug, 4);

  additionalBytes.description = `32 bits length of the array: ${length}`;

  const children: Chunk[] = [];

  for (let i = 0; i < length; i++) {
    const value = debug.nextValue();

    children.push({
      ...value,
      description: `Array element in index ${i}: ${value.description}`,
    });
  }

  return {
    flag,
    description: `Message pack array32 flag (${flag})`,
    additionalBytes: [additionalBytes],
    children,
  };
};

const debugMap16: DebugSymbolFn = (debug) => {
  const flag = debug.buffer[debug.offset++];
  const { length, ...additionalBytes } = readLength(debug, 2);

  additionalBytes.description = `16 bits length of the map: ${length}`;

  const children: Chunk[] = [];

  for (let i = 0; i < length; i++) {
    const key = debug.nextValue();
    const value = debug.nextValue();

    children.push({
      ...key,
      description: `Map key in index ${i}: ${key.description}`,
    });

    children.push({
      ...value,
      description: `Map value in index ${i}: ${value.description}`,
    });
  }

  return {
    flag,
    description: `Message pack map16 flag (${flag})`,
    additionalBytes: [additionalBytes],
    children,
  };
};

const debugMap32: DebugSymbolFn = (debug) => {
  const flag = debug.buffer[debug.offset++];
  const { length, ...additionalBytes } = readLength(debug, 4);

  additionalBytes.description = `32 bits length of the map: ${length}`;

  const children: Chunk[] = [];

  for (let i = 0; i < length; i++) {
    const key = debug.nextValue();
    const value = debug.nextValue();

    children.push({
      ...key,
      description: `Map key in index ${i}: ${key.description}`,
    });

    children.push({
      ...value,
      description: `Map value in index ${i}: ${value.description}`,
    });
  }

  return {
    flag,
    description: `Message pack map32 flag (${flag})`,
    additionalBytes: [additionalBytes],
    children,
  };
};

const debugNegativeFixInt: DebugSymbolFn = (debug) => {
  const flag = debug.buffer[debug.offset++];
  const value = (flag & 0x1f) - 32; // Extract the value from the flag

  return {
    flag,
    description: `Message pack fix negative int flag ${flag} with value ${value}`,
  };
};

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

for (let i = 0; i <= 127; i++) {
  messagePackDebugSymbols[i] = debugSingleByte(
    `Message pack fix positive int: {FLAG}`,
  );
}

for (let i = 128; i <= 143; i++) {
  messagePackDebugSymbols[i] = debugFixMap;
}

for (let i = 144; i <= 159; i++) {
  messagePackDebugSymbols[i] = debugFixArray;
}

for (let i = 160; i <= 191; i++) {
  messagePackDebugSymbols[i] = debugFixStr;
}

for (let i = 224; i <= 255; i++) {
  messagePackDebugSymbols[i] = debugNegativeFixInt;
}

export default messagePackDebugSymbols;
