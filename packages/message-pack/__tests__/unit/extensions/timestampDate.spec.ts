import { expect, test } from 'vitest';
import TimestampDateExtension from '../../../src/extensions/timestampDate/timestampDate.ts';

test('parseToMessagePackTime', () => {
  const date = new Date('2001-02-03T04:05:06.789Z');

  const extension = new TimestampDateExtension();

  const messagePackTime = extension.parseToMessagePackTime(date);

  expect(messagePackTime).toEqual({ sec: 981173106, nsec: 789000000 });
});
