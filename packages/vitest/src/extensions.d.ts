import 'vitest';

declare module 'vitest' {
  interface Matchers {
    toBeByteAt(index: number, expectedByte: number): void;
    toBeBytes(expectedBytes: number[]): void;
    toBeBytesBetween(start: number, end: number, expectedBytes: number[]): void;
    toBeBytesLength(expectedLength: number): void;
    toHaveBytes(expectedBytes: number[]): void;
    toHaveBytesFrom(start: number, expectedBytes: number[]): void;
  }
}
