import assert from 'node:assert';

import { Decoder, encode } from '@schema-pack/message-pack';

const buffer = Uint8Array.from([0, 1, 2]);

/**
 * Demonstrates the behavior of the Decoder when the copyBuffers option is
 * disabled (default)
 */
let encoded = encode(buffer);

const sharedBuffersDecoder = new Decoder();

const decoded = sharedBuffersDecoder.decode<Uint8Array>(encoded);

// The decoded value shares its memory with the source buffer.
assert.ok(decoded.buffer === encoded.buffer);

// Writing to the source buffer changes the decoded value.
encoded[2] = 123;

assert.ok(decoded[0] === 123);

/**
 * Demonstrates the behavior of the Decoder when the copyBuffers option is
 * enabled.
 */
const copyBuffersDecoder = new Decoder({
  copyBuffers: true,
});

encoded = encode(buffer);

const decodedCopy = copyBuffersDecoder.decode<Uint8Array>(encoded);

// The decodedCopy value owns its memory.
assert.ok(decodedCopy.buffer !== encoded.buffer);

// Writing to the source buffer leaves the decodedCopy value untouched.
encoded[2] = 123;

assert.ok(decodedCopy[0] === 0);
