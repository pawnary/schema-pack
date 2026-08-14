import type Debugger from './debugger.ts';

export type Metadata = {
  startOffset: number;
  endOffset: number;
  description: string;
  warning?: string;
};

export type Chunk = Metadata & {
  flag: number;
  additionalBytes?: Metadata[];
  informationBytes?: Metadata;
  children?: Chunk[];
};

export type PartialChunk = Omit<Chunk, 'startOffset' | 'endOffset'>;

export type DebugSymbolFn = (debuggerInstance: Debugger) => PartialChunk;

/**
 * A mapping of debug symbols to their corresponding functions. Each debug
 * symbol, represented by a number between 0 and 255, is associated with a
 * function that takes a Debugger instance and returns a PartialChunk. This
 * allows for customized debugging behavior based on the specific debug symbol
 * encountered.
 */
export type DebugSymbols = Record<number, DebugSymbolFn>;
