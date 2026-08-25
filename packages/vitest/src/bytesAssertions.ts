import { expect } from 'vitest';

import extractDisplayBytes from './utils/extractDisplayBytes.ts';
import isNot from './utils/isNot.ts';

expect.extend({
  toBeByteAt(received: Uint8Array, index: number, expectedByte: number) {
    const pass = received[index] === expectedByte;

    return {
      message: (): string =>
        [
          `Expected ${extractDisplayBytes(received)}`,
          `${isNot(this)}to have byte ${expectedByte} at index ${index}`,
          `but got ${received[index]}`,
        ].join(' '),
      pass,
    };
  },
  toBeBytes(received: Uint8Array, expectedBytes: number[] | Uint8Array) {
    const missingBytes: number[] = [];

    let length = received.length;

    if (received.length < expectedBytes.length) {
      length = expectedBytes.length;
    }

    for (let offset = 0; offset < length; offset++) {
      if (!(offset in received)) {
        missingBytes.push(expectedBytes[offset]);
      } else if (!(offset in expectedBytes)) {
        missingBytes.push(received[offset]);
      } else if (received[offset] !== expectedBytes[offset]) {
        missingBytes.push(expectedBytes[offset]);
      }
    }

    const pass = missingBytes.length === 0;

    return {
      message: (): string =>
        [
          `Expected ${extractDisplayBytes(received)}`,
          `${isNot(this)}to be bytes`,
          extractDisplayBytes(expectedBytes),
          `but missing bytes ${extractDisplayBytes(missingBytes)}`,
        ].join(' '),
      pass,
    };
  },
  toBeBytesBetween(
    received: Uint8Array,
    start: number,
    end: number,
    expectedBytes: number[] | Uint8Array,
  ) {
    let pass = true;
    const currentBytes: number[] = [];

    for (let offset = start; offset <= end; offset++) {
      currentBytes.push(received[offset]);

      if (received[offset] !== expectedBytes[offset - start]) {
        pass = false;
        break;
      }
    }

    return {
      message: (): string =>
        [
          `Expected ${extractDisplayBytes(received)}`,
          `${isNot(this)}to be bytes`,
          extractDisplayBytes(expectedBytes),
          `between index ${start} and ${end} but got`,
          extractDisplayBytes(currentBytes),
        ].join(' '),
      pass,
    };
  },
  toBeBytesLength(received: Uint8Array, expectedLength: number) {
    const pass = received.byteLength === expectedLength;

    return {
      message: (): string =>
        [
          `Expected ${extractDisplayBytes(received)}`,
          `${isNot(this)}to have bytes length ${expectedLength} but got ${received.byteLength}`,
        ].join(' '),
      pass,
    };
  },
  toHaveBytes(received: Uint8Array, expectedBytes: number[] | Uint8Array) {
    let pass = true;

    for (let offset = 0; offset < expectedBytes.length; offset++) {
      if (received[offset] !== expectedBytes[offset]) {
        pass = false;
        break;
      }
    }

    return {
      message: (): string =>
        [
          `Expected ${extractDisplayBytes(received)}`,
          `${isNot(this)}to have bytes ${extractDisplayBytes(expectedBytes)}`,
        ].join(' '),
      pass,
    };
  },
  toHaveBytesFrom(
    received: Uint8Array,
    start: number,
    expectedBytes: number[] | Uint8Array,
  ) {
    let pass = true;

    for (let offset = 0; offset < expectedBytes.length; offset++) {
      if (received[start + offset] !== expectedBytes[offset]) {
        pass = false;
        break;
      }
    }

    return {
      message: (): string =>
        [
          `Expected ${extractDisplayBytes(received)}`,
          `${isNot(this)}to have bytes ${extractDisplayBytes(expectedBytes)}`,
          `from index ${start} but got ${extractDisplayBytes([...received].slice(start))}`,
        ].join(' '),
      pass,
    };
  },
});
