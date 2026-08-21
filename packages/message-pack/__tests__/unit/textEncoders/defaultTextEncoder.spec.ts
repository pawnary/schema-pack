import { expect, test, vi } from 'vitest';

import DefaultTextEncoder from '../../../src/encoder/textEncoders/defaultTextEncoder.ts';

test('writeBytes', () => {
  const buffer = new Uint8Array(2);
  const encoder = new DefaultTextEncoder();

  const spy = vi.spyOn(encoder.nativeTextEncoder, 'encodeInto');

  const writtenBytes = encoder.writeBytes('ab', buffer);

  expect(writtenBytes).toBe(2);

  expect(spy).toHaveBeenCalledWith('ab', buffer);
});
