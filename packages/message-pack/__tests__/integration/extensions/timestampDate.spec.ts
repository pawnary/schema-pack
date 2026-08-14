import TimestampDate from '../../../src/extensions/timestampDate.ts';
import Encoder from '../../../src/encoder/encoder.ts';
import { describe, expect, it } from 'vitest';
import FLAG from '../../../src/symbols.ts';
import Decoder from '../../../src/decoder/decoder.ts';

describe('encode and decode Date', () => {
  const extension = new TimestampDate();

  const encoder = new Encoder();
  encoder.addInternalExtension(extension);

  const decoder = new Decoder();
  decoder.addInternalExtension(extension);

  it('encode 32 bits date', () => {
    const date = new Date('2001-02-03T04:05:06.000Z');

    const encoded = encoder.encode(date);

    expect(encoded).toBeBytes([FLAG.FIXEXT4, 255, 58, 123, 131, 114]);

    const decoded = decoder.decode(encoded);

    expect(decoded).toEqual(date);
  });

  it('encode 64 bits date', () => {
    const date = new Date('2654-03-02T01:09:08.765Z');

    const encoded = encoder.encode(date);

    // @see https://github.com/msgpack/msgpack-javascript/issues/216
    expect(encoded).toBeBytes([
      FLAG.EXT8,
      12,
      255,
      45,
      152,
      249,
      64,
      0,
      0,
      0,
      5,
      6,
      223,
      157,
      52,
    ]);

    const decoded = decoder.decode(encoded);

    expect(decoded).toEqual(date);
  });

  it('encode 96 bits date', () => {
    const date = new Date('+275760-09-11T23:59:59.9999Z');

    const encoded = encoder.encode(date);

    // @see https://github.com/msgpack/msgpack-javascript/issues/216
    expect(encoded).toBeBytes([
      FLAG.EXT8,
      12,
      255,
      59,
      139,
      135,
      192,
      0,
      0,
      7,
      219,
      168,
      32,
      46,
      127,
    ]);

    const decoded = decoder.decode(encoded);

    expect(decoded).toEqual(date);
  });
});
