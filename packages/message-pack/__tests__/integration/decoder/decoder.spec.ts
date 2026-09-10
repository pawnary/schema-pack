import { describe, expect, it, vi } from 'vitest';

import Decoder from '../../../src/decoder/decoder.ts';
import Encoder from '../../../src/encoder/encoder.ts';
import type MessagePackExtension from '../../../src/extensions/interfaces/messagePackExtension.ts';

describe('fromEncoder', () => {
  it('should create a decoder from an encoder with default options', () => {
    const encoder = new Encoder();

    const decoder = Decoder.fromEncoder(encoder);

    expect(decoder.bigIntExtension).toBe(encoder.bigIntExtension);
    expect(decoder.errorExtension).toBe(encoder.errorExtension);
    expect(decoder.timestampDateExtension).toBe(encoder.timestampDateExtension);
    expect(decoder.buffer).toBeInstanceOf(Uint8Array);
  });

  it('should create a decoder from an encoder with custom buffer factory', () => {
    const encoder = new Encoder({
      bufferFactory: (): Buffer => Buffer.alloc(1024),
    });

    const decoder = Decoder.fromEncoder(encoder);

    expect(decoder.buffer).toBeInstanceOf(Buffer);
  });

  it('should create a decoder from an encoder with custom extensions', () => {
    const extension: MessagePackExtension = {
      constructors: [],
      decode: vi.fn<() => object>(),
      encode: vi.fn<() => void>(),
      type: 123,
    };

    const encoder = new Encoder();
    encoder.addExtension(extension);

    const decoder = Decoder.fromEncoder(encoder);

    expect(decoder.getExtensions().get(123)).toBe(extension);
  });

  it('should create a decoder from an encoder with default extensions disabled', () => {
    const encoder = new Encoder({
      extensions: false,
    });

    const decoder = Decoder.fromEncoder(encoder);

    expect(decoder.bigIntExtension).toBeUndefined();
    expect(decoder.errorExtension).toBeUndefined();
    expect(decoder.timestampDateExtension).toBeUndefined();
  });
});
