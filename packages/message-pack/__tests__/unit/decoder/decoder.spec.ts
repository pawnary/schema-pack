import { describe, expect, it, vi } from 'vitest';

import Decoder from '../../../src/decoder/decoder.ts';
import type MessagePackExtension from '../../../src/extensions/interfaces/messagePackExtension.ts';
import Symbols from '../../../src/symbols.ts';

class PublicDecoder extends Decoder {
  public override decodeBigInt(length: number): bigint {
    return super.decodeBigInt(length);
  }

  public override decodeExtension(
    extensionId: number,
    length: number,
  ): unknown {
    return super.decodeExtension(extensionId, length);
  }
}

describe('decodeBigInt', () => {
  // 1n encoded using zigzag encoding
  const bigIntBuffer = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 2]);

  it('should fails when BigInt extension is disabled', () => {
    const decoder = new PublicDecoder({
      extensions: {
        bigInt: false,
      },
    });

    decoder.setBuffer(new Uint8Array(bigIntBuffer));

    expect(() => decoder.decodeBigInt(8)).toThrow(
      'BigInt extension is disabled, cannot decode BigInt.',
    );
  });

  it('should decode correctly', () => {
    const decoder = new PublicDecoder();

    decoder.setBuffer(new Uint8Array(bigIntBuffer));

    const result = decoder.decodeBigInt(8);

    expect(result).toBe(1n);
    expect(decoder.offset).toBe(8);
  });
});

describe('decodeExtension', () => {
  it('should call decodeBigInt', () => {
    const decoder = new PublicDecoder({
      extensions: {
        bigInt: {
          type: 123,
        },
      },
    });

    const decodeBigIntSpy = vi
      .spyOn(decoder, 'decodeBigInt')
      .mockReturnValueOnce(456n);

    const result = decoder.decodeExtension(123, 12);

    expect(result).toBe(456n);
    expect(decodeBigIntSpy).toHaveBeenCalledWith(12);
  });

  it('should fails when extension does not advance the decoder offset', () => {
    const decoder = new PublicDecoder({
      extensions: false,
    });

    const decodeFn = vi.fn<MessagePackExtension['decode']>(
      () => new Uint8Array(0),
    );

    decoder.addExtension({
      constructors: [],
      decode: decodeFn,
      encode: vi.fn<() => void>(),
      type: 123,
    });

    expect(() => decoder.decodeExtension(123, 12)).toThrow(
      'Extension decoder did not consume the expected number of bytes for extensionId 123 and length 12.',
    );

    expect(decodeFn).toHaveBeenCalledWith(decoder, 12);
  });

  it('should decode correctly', () => {
    const decoder = new PublicDecoder();

    const value = new Uint8Array(11);

    const decodeFn = vi.fn<MessagePackExtension['decode']>(
      (extensionDecoder) => {
        extensionDecoder.offset += value.length;

        return value;
      },
    );

    decoder.addExtension({
      constructors: [],
      decode: decodeFn,
      encode: vi.fn<() => void>(),
      type: 123,
    });

    const result = decoder.decodeExtension(123, 11);

    expect(result).toBe(value);
    expect(decodeFn).toHaveBeenCalledWith(decoder, 11);
  });
});

describe('message pack types', () => {
  describe('extensions', () => {
    describe('ext16', () => {
      const ext16Bytes = new Uint8Array(256).fill(42);

      it('read positive extension id', () => {
        const bufferWithExtension = new Uint8Array([
          Symbols.EXT16,
          1,
          0,
          127,
          ...ext16Bytes,
        ]);

        const decoder = new Decoder();

        decoder.addExtension({
          constructors: [],
          decode: vi.fn<MessagePackExtension['decode']>((extensionDecoder) => {
            extensionDecoder.offset += ext16Bytes.length;

            return Uint8Array.from(ext16Bytes);
          }),
          encode: vi.fn<() => void>(),
          type: 127,
        });

        decoder.setBuffer(bufferWithExtension);

        const decoded = decoder.nextValue();

        expect(decoded).toBeBytes(ext16Bytes);
      });

      it('read negative extension id', () => {
        const bufferWithExtension = new Uint8Array([
          Symbols.EXT16,
          1,
          0,
          129,
          ...ext16Bytes,
        ]);

        const decoder = new Decoder();

        decoder.addExtension({
          constructors: [],
          decode: vi.fn<MessagePackExtension['decode']>((extensionDecoder) => {
            extensionDecoder.offset += ext16Bytes.length;

            return Uint8Array.from(ext16Bytes);
          }),
          encode: vi.fn<() => void>(),
          type: -127,
        });

        decoder.setBuffer(bufferWithExtension);

        const decoded = decoder.nextValue();

        expect(decoded).toBeBytes(ext16Bytes);
      });
    });

    describe('ext32', () => {
      const ext32Bytes = new Uint8Array(65_536).fill(42);

      it('read positive extension id', () => {
        const bufferWithExtension = new Uint8Array([
          Symbols.EXT32,
          0,
          1,
          0,
          0,
          127,
          ...ext32Bytes,
        ]);

        const decoder = new Decoder();

        decoder.addExtension({
          constructors: [],
          decode: vi.fn<MessagePackExtension['decode']>((extensionDecoder) => {
            extensionDecoder.offset += ext32Bytes.length;

            return Uint8Array.from(ext32Bytes);
          }),
          encode: vi.fn<() => void>(),
          type: 127,
        });

        decoder.setBuffer(bufferWithExtension);

        const decoded = decoder.nextValue();

        expect(decoded).toBeBytes(ext32Bytes);
      });

      it('read negative extension id', () => {
        const bufferWithExtension = new Uint8Array([
          Symbols.EXT32,
          0,
          1,
          0,
          0,
          129,
          ...ext32Bytes,
        ]);

        const decoder = new Decoder();

        decoder.addExtension({
          constructors: [],
          decode: vi.fn<MessagePackExtension['decode']>((extensionDecoder) => {
            extensionDecoder.offset += ext32Bytes.length;

            return Uint8Array.from(ext32Bytes);
          }),
          encode: vi.fn<() => void>(),
          type: -127,
        });

        decoder.setBuffer(bufferWithExtension);

        const decoded = decoder.nextValue();

        expect(decoded).toBeBytes(ext32Bytes);
      });
    });
  });
});
