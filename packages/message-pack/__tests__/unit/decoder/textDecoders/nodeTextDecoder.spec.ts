import { expect, test } from 'vitest';

import NodeTextDecoder from '../../../../src/decoder/textDecoders/nodeTextDecoder.ts';

test('decode', () => {
  const decoder = new NodeTextDecoder();

  const encoded = Buffer.from('foo');

  expect(encoded).toBeBytes([102, 111, 111]);

  const result = decoder.decode(encoded, 0, 3);

  expect(result).toBe('foo');
});
