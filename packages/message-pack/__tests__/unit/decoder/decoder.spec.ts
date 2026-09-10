import Symbols from '@schema-pack/message-pack/symbols.ts';
import { describe, expect, it, vi } from 'vitest';

import Decoder from '../../../src/decoder/decoder.ts';

describe('ext16', () => {
  it('read positive extension id', () => {
    const informationBytes = new Uint8Array(256).fill(42);

    const bufferWithExtension = new Uint8Array([
      Symbols.EXT16,
      1,
      0,
      127,
      ...informationBytes,
    ]);

    const decoder = new Decoder();

    decoder.addExtension({
      constructors: [],
      decode: vi.fn<() => Uint8Array>(() => Uint8Array.from(informationBytes)),
      encode: vi.fn<() => void>(),
      type: 127,
    });

    decoder.setBuffer(bufferWithExtension);

    const decoded = decoder.nextValue();

    expect(decoded).toBeBytes(informationBytes);
  });

  it('read negative extension id', () => {
    const informationBytes = new Uint8Array(256).fill(42);

    const bufferWithExtension = new Uint8Array([
      Symbols.EXT16,
      1,
      0,
      129,
      ...informationBytes,
    ]);

    const decoder = new Decoder();

    decoder.addExtension({
      constructors: [],
      decode: vi.fn<() => Uint8Array>(() => Uint8Array.from(informationBytes)),
      encode: vi.fn<() => void>(),
      type: -127,
    });

    decoder.setBuffer(bufferWithExtension);

    const decoded = decoder.nextValue();

    expect(decoded).toBeBytes(informationBytes);
  });
});

describe('ext32', () => {
  const informationBytes = new Uint8Array(65_536).fill(42);

  it('read positive extension id', () => {
    const bufferWithExtension = new Uint8Array([
      Symbols.EXT32,
      0,
      1,
      0,
      0,
      127,
      ...informationBytes,
    ]);

    const decoder = new Decoder();

    decoder.addExtension({
      constructors: [],
      decode: vi.fn<() => Uint8Array>(() => Uint8Array.from(informationBytes)),
      encode: vi.fn<() => void>(),
      type: 127,
    });

    decoder.setBuffer(bufferWithExtension);

    const decoded = decoder.nextValue();

    expect(decoded).toBeBytes(informationBytes);
  });

  it('read negative extension id', () => {
    const bufferWithExtension = new Uint8Array([
      Symbols.EXT32,
      0,
      1,
      0,
      0,
      129,
      ...informationBytes,
    ]);

    const decoder = new Decoder();

    decoder.addExtension({
      constructors: [],
      decode: vi.fn<() => Uint8Array>(() => Uint8Array.from(informationBytes)),
      encode: vi.fn<() => void>(),
      type: -127,
    });

    decoder.setBuffer(bufferWithExtension);

    const decoded = decoder.nextValue();

    expect(decoded).toBeBytes(informationBytes);
  });
});
