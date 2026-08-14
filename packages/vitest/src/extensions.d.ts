import 'vitest';

declare module 'vitest' {
  interface Matchers<T = any> {
    toBeBytes(expectedBytes: number[]): void;
    toBeBytesBetween(start: number, end: number, expectedBytes: number[]): void;
    toBeByteAt(index: number, expectedByte: number): void;
    toHaveBytes(expectedBytes: number[]): void;
    toHaveBytesFrom(start: number, expectedBytes: number[]): void;
    toHaveBytesLength(expectedLength: number): void;
  }
}
