import './extensions.d.ts';
import type { SyncExpectationResult } from '@vitest/expect';
import { expect } from 'vitest';

import type { BufferLike } from './types.ts';
import extractDisplayBytes from './utils/extractDisplayBytes.ts';
import isNot from './utils/isNot.ts';

expect.extend({
  toBeByteAt(
    received: BufferLike,
    index: number,
    expectedByte: number,
  ): SyncExpectationResult {
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
  toBeBytes(
    received: BufferLike,
    expectedBytes: BufferLike,
  ): SyncExpectationResult {
    const missingBytes: (number | bigint)[] = [];

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
    received: BufferLike,
    start: number,
    end: number,
    expectedBytes: BufferLike,
  ): SyncExpectationResult {
    let pass = true;
    const currentBytes: (number | bigint)[] = [];

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
  toBeBytesLength(
    received: BufferLike,
    expectedLength: number,
  ): SyncExpectationResult {
    const pass = received.length === expectedLength;

    return {
      message: (): string =>
        [
          `Expected ${extractDisplayBytes(received)}`,
          `${isNot(this)}to have bytes length ${expectedLength} but got ${received.length}`,
        ].join(' '),
      pass,
    };
  },
  toContainBytes(
    received: BufferLike,
    expectedBytes: BufferLike,
  ): SyncExpectationResult {
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
  toContainBytesFrom(
    received: BufferLike,
    start: number,
    expectedBytes: BufferLike,
  ): SyncExpectationResult {
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
