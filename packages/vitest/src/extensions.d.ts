import 'vitest';

declare module 'vitest' {
  interface Matchers {
    toBeByteAt(index: number, expectedByte: number): void;
    toBeBytes(expectedBytes: number[] | Uint8Array): void;
    toBeBytesBetween(
      start: number,
      end: number,
      expectedBytes: number[] | Uint8Array,
    ): void;
    toBeBytesLength(expectedLength: number): void;
    toHaveBytes(expectedBytes: number[] | Uint8Array): void;
    toHaveBytesFrom(start: number, expectedBytes: number[] | Uint8Array): void;
  }
}
