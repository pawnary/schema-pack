import { expect, test, vi } from 'vitest';

import Encoder from '../../src/encoder/encoder.ts';
import DefaultTextEncoder from '../../src/encoder/textEncoders/defaultTextEncoder.ts';

test('constructor options', () => {
  const textEncoder = new DefaultTextEncoder();
  const newBufferFn = vi.fn<(size: number) => Uint8Array>(
    (size) => new Uint8Array(size),
  );

  const encoder = new Encoder({
    initialBufferSize: 123,
    initialSharedBufferSize: 456,
    newBufferFn,
    sortKeys: true,
    textEncoder,
  });

  expect(encoder.buffer.textEncoder).toBe(textEncoder);
  expect(encoder.buffer.buffer).toBeInstanceOf(Uint8Array);
  expect(encoder.buffer.buffer).toHaveLength(123);
  expect(encoder.buffer.sortKeys).toBe(true);

  expect(newBufferFn).toHaveBeenCalledTimes(2);
  expect(newBufferFn).toHaveBeenNthCalledWith(1, 123);
  expect(newBufferFn).toHaveBeenNthCalledWith(2, 456);

  expect(encoder.buffer.getExtensionBuffer().buffer).toHaveLength(456);
});

test('encode', () => {
  const encoder = new Encoder();

  const writeSpy = vi.spyOn(encoder.buffer, 'write');
  const flushSpy = vi.spyOn(encoder.buffer, 'flush');

  const value = { foo: 'bar' };

  const result = encoder.encode(value);

  expect(writeSpy).toHaveBeenCalledWith(value);
  expect(flushSpy).toHaveBeenCalledWith();

  expect(result).toBeInstanceOf(Uint8Array);
});

test('addExtension', () => {
  const encoder = new Encoder();

  const extension = {
    decode: vi.fn<() => void>(),
    encode: vi.fn<() => void>(),
    type: 1,
  };

  const addExtensionSpy = vi.spyOn(encoder.buffer, 'addExtension');

  encoder.addExtension(extension);

  expect(addExtensionSpy).toHaveBeenCalledWith(extension);
  expect(encoder.fetchExtension(1)).toBe(extension);
});

test('addInternalExtension', () => {
  const encoder = new Encoder();

  const extension = {
    decode: vi.fn<() => void>(),
    encode: vi.fn<() => void>(),
    type: -1,
  };

  const addInternalExtensionSpy = vi.spyOn(
    encoder.buffer,
    'addInternalExtension',
  );

  encoder.addInternalExtension(extension);

  expect(addInternalExtensionSpy).toHaveBeenCalledWith(extension);
  expect(encoder.fetchExtension(-1)).toBe(extension);
});

test('addExtensionType', () => {
  const encoder = new Encoder();

  const extension = {
    decode: vi.fn<() => void>(),
    encode: vi.fn<() => void>(),
  };

  const addExtensionSpy = vi.spyOn(encoder.buffer, 'addExtension');

  encoder.addExtensionType(2, extension);

  expect(addExtensionSpy).toHaveBeenCalledWith({ type: 2, ...extension });
  expect(encoder.fetchExtension(2)).toStrictEqual({ type: 2, ...extension });
});
