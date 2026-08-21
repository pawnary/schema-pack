import { expect, type MatcherState, test } from 'vitest';

import isNot from '../../src/utils/isNot.ts';

test('should return an empty string when isNot is false', () => {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const context = { isNot: false } as MatcherState;

  const result = isNot(context);

  expect(result).toBe('');
});

test('should return "not " when isNot is true', () => {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const context = { isNot: true } as MatcherState;

  const result = isNot(context);

  expect(result).toBe('not ');
});
