import { describe, expect, it, test } from 'vitest';
import Encoder from '../../../src/encoder/encoder.ts';
import BigIntExtension from '../../../src/extensions/bigint/bigInt.ts';
import Symbols from '../../../src/symbols.ts';
import { INT64_MIN, UINT64_MAX } from '../../../src/constants.ts';
import Decoder from '../../../src/decoder/decoder.ts';

const extension = new BigIntExtension(123);
const encoder = new Encoder().addExtension(extension);

describe('encode', () => {
  it('should not encode a uint64 and int64 values that are within the safe integer range', () => {
    // by default must encode a MessagePack uint 64
    expect(encoder.encode(UINT64_MAX)).toBeBytes([
      Symbols.UINT64,
      0,
      31,
      255,
      255,
      255,
      255,
      255,
      255,
    ]);

    // by default must encode a MessagePack int 64
    expect(encoder.encode(INT64_MIN)).toBeBytes([
      Symbols.INT64,
      255,
      224,
      0,
      0,
      0,
      0,
      0,
      1,
    ]);
  });

  it('should encode a BigInt value that is outside the safe integer range', () => {
    const value = BigInt(UINT64_MAX) + 1n;

    const result = encoder.encode(value);

    expect(result).toBeBytes([Symbols.FIXEXT8, 123, 0, 64, 0, 0, 0, 0, 0, 0]);
  });

  it('should encode a small BigInt', () => {
    const value = 123n;

    const result = encoder.encode(value);

    expect(result).toBeBytes([Symbols.FIXEXT8, 123, 0, 0, 0, 0, 0, 0, 0, 246]);
  });
});

describe('encode and decode', () => {
  const decoder = new Decoder();
  decoder.addExtension(extension);

  test('positive large bigint', () => {
    const value = 123456789012345678901234567890n;

    const encoded = encoder.encode(value);

    expect(encoded).toBeBytes([
      Symbols.FIXEXT16,
      123,
      134,
      231,
      193,
      220,
      156,
      126,
      21,
      164,
      0,
      0,
      0,
      3,
      29,
      210,
      31,
      237,
    ]);

    const decoded = decoder.decode(encoded);

    expect(decoded).toBe(value);
  });

  test('negative large bigint', () => {
    const value = -123456789012345678901234567890n;

    const encoded = encoder.encode(value);

    expect(encoded).toBeBytes([
      Symbols.FIXEXT16,
      123,
      134,
      231,
      193,
      220,
      156,
      126,
      21,
      163,
      0,
      0,
      0,
      3,
      29,
      210,
      31,
      237,
    ]);

    const decoded = decoder.decode(encoded);

    expect(decoded).toBe(value);
  });
});
