import assert from 'node:assert';

import { Decoder, Encoder } from '@schema-pack/message-pack';

const encoder = new Encoder();
const decoder = new Decoder();

const error = new TypeError('invalid input');

const buffer = encoder.writeError(error).flush();

const decoded = decoder.decode(buffer);

console.log({ decoded, error });

assert.deepStrictEqual(
  decoded,
  error,
  'Decoded error does not match the original error',
);
