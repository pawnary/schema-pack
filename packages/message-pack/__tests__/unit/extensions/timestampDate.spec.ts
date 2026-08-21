import { expect, test } from 'vitest';

import TimestampDateExtension from '../../../src/extensions/timestampDate/timestampDate.ts';

test('parseToMessagePackTime', () => {
  const date = new Date('2001-02-03T04:05:06.789Z');

  const extension = new TimestampDateExtension();

  const messagePackTime = extension.parseToMessagePackTime(date);

  expect(messagePackTime).toStrictEqual({
    nsec: 789_000_000,
    sec: 981_173_106,
  });
});
