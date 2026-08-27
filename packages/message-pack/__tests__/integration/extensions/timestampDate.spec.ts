import { beforeAll, describe, expect, it } from 'vitest';

import Decoder from '../../../src/decoder/decoder.ts';
import Encoder from '../../../src/encoder/encoder.ts';
import TimestampDateExtension from '../../../src/extensions/timestampDate/timestampDate.ts';
import FLAG from '../../../src/symbols.ts';

describe('encode and decode Date', () => {
  const extension = new TimestampDateExtension();
  const encoder = new Encoder();
  const decoder = new Decoder();

  beforeAll(() => {
    encoder.addInternalExtension(extension);
    decoder.addInternalExtension(extension);
  });

  it('encode 32 bits date', () => {
    const date = new Date('2001-02-03T04:05:06.000Z');

    const encoded = encoder.write(date).flush();

    expect(encoded).toBeBytes([FLAG.FIXEXT4, 255, 58, 123, 131, 114]);

    const decoded = decoder.decode(encoded);

    expect(decoded).toStrictEqual(date);
  });

  it('encode 64 bits date', () => {
    const date = new Date('2654-03-02T01:09:08.765Z');

    const encoded = encoder.write(date).flush();

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

    expect(decoded).toStrictEqual(date);
  });

  it('encode 96 bits date', () => {
    const date = new Date('+275760-09-11T23:59:59.9999Z');

    const encoded = encoder.write(date).flush();

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

    expect(decoded).toStrictEqual(date);
  });
});
