import { expect, test } from 'vitest';

import assertValidExtensionType from '../../../src/utils/assertValidExtensionType.ts';

test('non integer extension type', () => {
  expect(() => {
    assertValidExtensionType(1.5);
  }).toThrow('Extension type must be an integer, got 1.5');
});

test('extension type out of range', () => {
  expect(() => {
    assertValidExtensionType(128);
  }).toThrow('Extension type must be in the range -128 to 127, got 128');

  expect(() => {
    assertValidExtensionType(-129);
  }).toThrow('Extension type must be in the range -128 to 127, got -129');
});

test('valid extension type', () => {
  expect(() => {
    assertValidExtensionType(0);
  }).not.toThrow();

  expect(() => {
    assertValidExtensionType(127);
  }).not.toThrow();

  expect(() => {
    assertValidExtensionType(-128);
  }).not.toThrow();
});
