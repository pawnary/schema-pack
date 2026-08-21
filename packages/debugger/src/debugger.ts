import type { Chunk, DebugSymbols } from './types.ts';
import chunkToString from './utils/chunkToString.ts';

class Debugger {
  buffer: Uint8Array;
  view: DataView;
  textDecoder: TextDecoder;
  offset: number;
  debugSymbols: DebugSymbols;

  /**
   * An internal offset is used to prevent infinite loops in the debug process.
   * It ensures that the debugger does not exceed the length of the buffer,
   * which could lead to unexpected behavior or crashes. This is particularly
   * important when dealing with potentially malformed data.
   */
  #internalOffset: number;

  constructor(debugSymbols: DebugSymbols) {
    this.buffer = new Uint8Array();
    this.view = new DataView(this.buffer.buffer);
    this.textDecoder = new TextDecoder();
    this.debugSymbols = debugSymbols;
    this.offset = 0;
    this.#internalOffset = 0;

    for (let symbol = 0; symbol < 256; symbol++) {
      if (!(symbol in this.debugSymbols)) {
        throw new Error(`Missing debug symbol: ${symbol}`);
      }
    }
  }

  setBuffer(buffer: Uint8Array): void {
    this.buffer = new Uint8Array(buffer); // ensures buffer byteOffset is reset
    this.view = new DataView(this.buffer.buffer);
    this.offset = 0;
    this.#internalOffset = 0;
  }

  nextValue(): Chunk {
    const startOffset = this.offset;
    const flag = this.buffer[startOffset];

    if (!(flag in this.debugSymbols)) {
      throw new Error(`Missing debug symbol: ${flag}`);
    }

    const debugFn = this.debugSymbols[flag];
    const partialChunk = debugFn(this);

    let endOffset: number;

    if (partialChunk.informationBytes) {
      endOffset = partialChunk.informationBytes.endOffset;
    } else if (partialChunk.children && partialChunk.children.length > 0) {
      const lastChild = partialChunk.children.at(-1);

      if (!lastChild) {
        throw new Error(
          `Expected last child to be defined, but got undefined. This indicates a logic error in the debug function for flag ${flag}.`,
        );
      }

      endOffset = lastChild.endOffset;
    } else {
      endOffset = startOffset;

      if (partialChunk.additionalBytes) {
        for (const additionalByte of partialChunk.additionalBytes) {
          endOffset += additionalByte.endOffset;
        }
      }
    }

    const chunk = {
      ...partialChunk,
      endOffset,
      startOffset,
    };

    return chunk;
  }

  debug(buffer: Uint8Array): Chunk[] {
    this.setBuffer(buffer);

    const chunks: Chunk[] = [];

    do {
      chunks.push(this.nextValue());
    } while (
      this.offset < this.buffer.length &&
      ++this.#internalOffset < this.buffer.length
    );

    return chunks;
  }

  debugToString(buffer: Uint8Array): string {
    this.setBuffer(buffer);

    let output = '';

    do {
      const chunk = this.nextValue();

      output += chunkToString(buffer, chunk);
    } while (
      this.offset < this.buffer.length &&
      ++this.#internalOffset < this.buffer.length
    );

    return output;
  }
}

export default Debugger;
