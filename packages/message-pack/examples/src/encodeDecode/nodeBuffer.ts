import assert from 'node:assert';
import { Buffer } from 'node:buffer';

import { Decoder, Encoder } from '@schema-pack/message-pack';
import type { BufferFactory } from '@schema-pack/message-pack/types';

const bufferFactory: BufferFactory<Buffer> = (size: number) =>
  Buffer.alloc(size);

const encoder = new Encoder({ bufferFactory });
const decoder = new Decoder({ bufferFactory });

const value = 12_345_678_901_234_567_890_123_456_789n;

const buffer = encoder.writeBigInt(value).flush();

const decoded = decoder.decode<bigint>(buffer);

console.log('Original value:', value);
console.log('Encoded buffer:', buffer);
console.log('Decoded value:', decoded);

assert.deepStrictEqual(
  decoded,
  value,
  'Decoded value does not match the original value',
);
