import { expect } from 'vitest';

function extractDisplayBytes(received: Uint8Array): string {
  if (received.length < 1) {
    return 'empty bytes';
  } else {
    if (received.length > 10) {
      return `Bytes(${received.subarray(0, 10)}...${received.subarray(received.length - 10)})`;
    } else {
      return `Bytes(${received})`;
    }
  }
}

expect.extend({
  toHaveBytesLength(received: Uint8Array, expectedLength: number) {
    const pass = received.byteLength === expectedLength;

    const { isNot } = this;

    return {
      message: () =>
        `expected
${received.length ? `${extractDisplayBytes(received)}` : 'empty bytes'}
${isNot ? 'not ' : ''}to have bytes length ${expectedLength} but got ${received.byteLength}`,
      pass,
    };
  },
  toBeByteAt(received: Uint8Array, index: number, expectedByte: number) {
    const pass = received[index] === expectedByte;

    const { isNot } = this;

    return {
      message: () =>
        `expected ${received} ${isNot ? 'not ' : ''}to have byte ${expectedByte} at index ${index} but got ${received[index]}`,
      pass,
    };
  },
  toHaveBytes(received: Uint8Array, expectedBytes: number[]) {
    const pass = expectedBytes.every((byte, index) => received[index] === byte);

    const { isNot } = this;

    return {
      message: () =>
        `expected ${received} ${isNot ? 'not ' : ''}to have bytes ${expectedBytes} but got ${received.length > 0 ? Array.from(received) : 'empty bytes'}`,
      pass,
    };
  },
  toBeBytesBetween(
    received: Uint8Array,
    start: number,
    end: number,
    expectedBytes: number[],
  ) {
    let pass = true;

    for (let i = start; i <= end; i++) {
      if (received[i] !== expectedBytes[i - start]) {
        pass = false;
        break;
      }
    }

    const { isNot } = this;

    return {
      message: () =>
        `expected ${received}
${isNot ? 'not ' : ''}to be bytes
${expectedBytes}
between index ${start} and ${end} but got
${Array.from(received).slice(start, end + 1)}`,
      pass,
    };
  },
  toHaveBytesFrom(
    received: Uint8Array,
    start: number,
    expectedBytes: number[],
  ) {
    const pass = expectedBytes.every(
      (byte, index) => received[start + index] === byte,
    );

    const { isNot } = this;

    return {
      message: () =>
        `expected ${received} ${isNot ? 'not ' : ''}to have bytes ${expectedBytes} from index ${start} but got ${Array.from(received).slice(start)}`,
      pass,
    };
  },
});

expect.extend({
  toBeBytes(received: Uint8Array, expectedBytes: number[]) {
    // const pass = received.length === expectedBytes.length && expectedBytes.every((byte, index) => received[index] === byte);
    let pass = false;
    let missingBytes: number[] = [];

    if (received.length !== expectedBytes.length) {
      missingBytes = expectedBytes.filter(
        (byte, index) => received[index] !== byte,
      );
    } else {
      for (let i = 0; i < expectedBytes.length; i++) {
        if (received[i] !== expectedBytes[i]) {
          missingBytes.push(expectedBytes[i]);
        }
      }
      pass = missingBytes.length === 0;
    }

    const { isNot } = this;

    return {
      message: () => {
        let message = 'expected';

        if (received.length < 1) {
          message += ' empty bytes';
        } else {
          if (received.length > 10) {
            message += ` Bytes(${received.subarray(0, 10)}...${received.subarray(received.length - 10)})`;
          } else {
            message += ` Bytes(${received})`;
          }
        }

        if (isNot) {
          message += ' not';
        }

        message += ` to be bytes ${extractDisplayBytes(new Uint8Array(expectedBytes))}`;

        if (missingBytes.length > 0) {
          message += ` but missing bytes ${extractDisplayBytes(new Uint8Array(missingBytes))}`;
        }

        return message;
      },
      pass,
    };
  },
});
