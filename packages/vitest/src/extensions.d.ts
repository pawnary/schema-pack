// oxlint-disable typescript/consistent-type-imports
import 'vitest';

declare module 'vitest' {
  type BufferLike = import('./types.ts').BufferLike;

  interface Matchers {
    toBeByteAt(index: number, expectedByte: number): void;
    toBeBytes(expectedBytes: BufferLike): void;
    toBeBytesBetween(
      start: number,
      end: number,
      expectedBytes: BufferLike,
    ): void;
    toBeBytesLength(expectedLength: number): void;
    toContainBytes(expectedBytes: BufferLike): void;
    toContainBytesFrom(start: number, expectedBytes: BufferLike): void;
  }
}
