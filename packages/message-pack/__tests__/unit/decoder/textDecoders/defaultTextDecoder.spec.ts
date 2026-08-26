import { expect, test } from 'vitest';

import DefaultTextDecoder from '../../../../src/decoder/textDecoders/defaultTextDecoder.ts';

test('decode', () => {
  const decoder = new DefaultTextDecoder();

  const textEncoder = new TextEncoder();

  const encoded = textEncoder.encode('foo');

  expect(encoded).toBeBytes([102, 111, 111]);

  const result = decoder.decode(encoded, 0, 3);

  expect(result).toBe('foo');
});
