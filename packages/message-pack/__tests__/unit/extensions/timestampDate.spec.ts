import { describe, expect, test } from 'vitest';
import TimestampDate from '../../../src/extensions/timestampDate.ts';
import EncoderBuffer from '../../../src/encoder/encoderBuffer.ts';

test('parseToMessagePackTime', () => {
  const date = new Date('2001-02-03T04:05:06.789Z');

  const extension = new TimestampDate();

  const messagePackTime = extension.parseToMessagePackTime(date);

  expect(messagePackTime).toEqual({ sec: 981173106, nsec: 789000000 });
});

// describe('encode', () => {
//   test('timestamp 32', () => {
//     const buffer = new EncoderBuffer();
//     const date = new Date('2001-02-03T04:05:06.000Z');

//     const extension = new TimestampDate();

//     extension.encode(date, buffer);

//     expect(buffer.flush()).toBeBytes([58, 123, 131, 114]);
//   });

//   test('timestamp 64', () => {
//     const buffer = new EncoderBuffer();
//     const date = new Date('2001-02-03T04:05:06.789Z');

//     const extension = new TimestampDate();

//     extension.encode(date, buffer);

//     expect(buffer.flush()).toBeBytes([188, 28, 189, 0, 58, 123, 131, 114]);
//   });

//   test('timestamp 96', () => {
//     const buffer = new EncoderBuffer();
//     const date = new Date('+275760-09-11T23:59:59.9999Z');

//     const extension = new TimestampDate();

//     extension.encode(date, buffer);

//     expect(buffer.flush()).toBeBytes([
//       59, 139, 135, 192, 0, 0, 7, 219, 168, 32, 46, 127,
//     ]);
//   });
// });
