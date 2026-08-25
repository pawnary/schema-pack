import { describe, expect, it } from 'vitest';

import extractDisplayBytes from '../../src/utils/extractDisplayBytes.ts';

const bigArray = new Array(100).fill(0).map((_value, index) => index);

describe('uint8Array', () => {
  describe('big Uint8Array', () => {
    const bytes = new Uint8Array(bigArray);

    it('should extract display bytes with start and end offset', () => {
      expect(extractDisplayBytes(bytes, 0, 2)).toBe('Bytes(0,1,...,98,99)');
    });

    it('should extract display bytes with default offsets (0 to 10)', () => {
      expect(extractDisplayBytes(bytes)).toBe(
        'Bytes(0,1,2,3,4,5,6,7,8,9,...,90,91,92,93,94,95,96,97,98,99)',
      );
    });
  });

  it('should extract display bytes with empty bytes', () => {
    expect(extractDisplayBytes(new Uint8Array())).toBe('empty Bytes()');
  });

  it('should extract display bytes with bytes less than trim length', () => {
    expect(extractDisplayBytes(new Uint8Array([1, 2, 3]), 5)).toBe(
      'Bytes(1,2,3)',
    );
  });
});

describe('number[]', () => {
  describe('big number[]', () => {
    it('should extract display bytes with trim length', () => {
      expect(extractDisplayBytes(bigArray, 0, 2)).toBe('Bytes(0,1,...,98,99)');
    });

    it('should extract display bytes with default trim length', () => {
      expect(extractDisplayBytes(bigArray)).toBe(
        'Bytes(0,1,2,3,4,5,6,7,8,9,...,90,91,92,93,94,95,96,97,98,99)',
      );
    });
  });

  it('should extract display bytes with empty Bytes()', () => {
    expect(extractDisplayBytes([])).toBe('empty Bytes()');
  });

  it('should extract display bytes with bytes less than trim length', () => {
    expect(extractDisplayBytes([1, 2, 3], 5)).toBe('Bytes(1,2,3)');
  });
});
