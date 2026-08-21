import { describe, expect, it } from 'vitest';

describe('toBeByteAt', () => {
  it('should pass when the byte at the specified index matches the expected byte', () => {
    const bytes = new Uint8Array([1, 2, 3, 4, 5]);

    expect(bytes).toBeByteAt(2, 3);
  });

  it('should fail when the byte at the specified index does not match the expected byte', () => {
    const bytes = new Uint8Array([1, 2, 3, 4, 5]);

    expect(() => {
      expect(bytes).toBeByteAt(2, 4);
    }).toThrow('Expected Bytes(1,2,3,4,5) to have byte 4 at index 2 but got 3');
  });

  it('should fail when the index is out of bounds', () => {
    const bytes = new Uint8Array([1, 2, 3, 4, 5]);

    expect(() => {
      expect(bytes).toBeByteAt(5, 6);
    }).toThrow(
      'Expected Bytes(1,2,3,4,5) to have byte 6 at index 5 but got undefined',
    );
  });

  it('should fail when using "not" and the byte at the specified index matches the expected byte', () => {
    const bytes = new Uint8Array([1, 2, 3, 4, 5]);

    expect(() => {
      expect(bytes).not.toBeByteAt(2, 3);
    }).toThrow(
      'Expected Bytes(1,2,3,4,5) not to have byte 3 at index 2 but got 3',
    );
  });
});

describe('toBeBytes', () => {
  it('should pass when the received bytes match the expected bytes', () => {
    const bytes = new Uint8Array([1, 2, 3, 4, 5]);

    expect(bytes).toBeBytes([1, 2, 3, 4, 5]);
  });

  it('should fail when the received bytes do not match the expected bytes', () => {
    const bytes = new Uint8Array([1, 2, 3, 4, 5]);

    expect(() => {
      expect(bytes).toBeBytes([1, 2, 3, 4]);
    }).toThrow(
      'Expected Bytes(1,2,3,4,5) to be bytes Bytes(1,2,3,4) but missing bytes Bytes(5)',
    );
  });

  it('should fail when the expected bytes are larger than the received bytes', () => {
    const bytes = new Uint8Array([1, 2, 3]);

    expect(() => {
      expect(bytes).toBeBytes([1, 2, 3, 4, 5]);
    }).toThrow(
      'Expected Bytes(1,2,3) to be bytes Bytes(1,2,3,4,5) but missing bytes Bytes(4,5)',
    );
  });

  it('should fail when using "not" and the received bytes match the expected bytes', () => {
    const bytes = new Uint8Array([1, 2, 3, 4, 5]);

    expect(() => {
      expect(bytes).not.toBeBytes([1, 2, 3, 4, 5]);
    }).toThrow('Expected Bytes(1,2,3,4,5) not to be bytes Bytes(1,2,3,4,5)');
  });
});

describe('toBeBytesBetween', () => {
  it('should pass when the bytes between the specified indices match the expected bytes', () => {
    const bytes = new Uint8Array([1, 2, 3, 4, 5]);

    expect(bytes).toBeBytesBetween(1, 3, [2, 3, 4]);
  });

  it('should fail when the bytes between the specified indices do not match the expected bytes', () => {
    const bytes = new Uint8Array([1, 2, 3, 4, 5]);

    expect(() => {
      expect(bytes).toBeBytesBetween(1, 3, [2, 3, 5]);
    }).toThrow(
      'Expected Bytes(1,2,3,4,5) to be bytes Bytes(2,3,5) between index 1 and 3 but got Bytes(2,3,4)',
    );
  });
});

describe('toBeBytesLength', () => {
  it('should pass when the bytes length matches the expected length', () => {
    const bytes = new Uint8Array([1, 2, 3, 4, 5]);

    expect(bytes).toBeBytesLength(5);
  });

  it('should fail when the bytes length does not match the expected length', () => {
    const bytes = new Uint8Array([1, 2, 3, 4, 5]);

    expect(() => {
      expect(bytes).toBeBytesLength(4);
    }).toThrow('Expected Bytes(1,2,3,4,5) to have bytes length 4 but got 5');
  });

  it('should fail when using "not" and the bytes length matches the expected length', () => {
    const bytes = new Uint8Array([1, 2, 3, 4, 5]);

    expect(() => {
      expect(bytes).not.toBeBytesLength(5);
    }).toThrow(
      'Expected Bytes(1,2,3,4,5) not to have bytes length 5 but got 5',
    );
  });
});

describe('toHaveBytes', () => {
  describe('match', () => {
    it('should pass when the received bytes match the expected bytes', () => {
      const bytes = new Uint8Array([1, 2, 3, 4, 5]);

      expect(bytes).toHaveBytes([1, 2, 3, 4, 5]);
      expect(bytes).toHaveBytes([1, 2, 3, 4]);
      expect(bytes).toHaveBytes([1, 2, 3]);
      expect(bytes).toHaveBytes([1, 2]);
      expect(bytes).toHaveBytes([1]);
    });

    it('should pass when the received bytes do not match the expected bytes', () => {
      const bytes = new Uint8Array([1, 2, 3, 4, 5]);

      expect(bytes).not.toHaveBytes([4, 5, 6, 7]);
    });
  });

  describe('not match', () => {
    it('should fail when the received bytes do not match the expected bytes', () => {
      const bytes = new Uint8Array([1, 2, 3, 4, 5]);

      expect(() => {
        expect(bytes).toHaveBytes([4, 5, 6, 7]);
      }).toThrow('Expected Bytes(1,2,3,4,5) to have bytes Bytes(4,5,6,7)');
    });

    it('should fail when the received bytes are empty and the expected bytes are not', () => {
      const bytes = new Uint8Array([]);

      expect(() => {
        expect(bytes).toHaveBytes([1, 2, 3]);
      }).toThrow('Expected empty bytes to have bytes Bytes(1,2,3)');
    });

    it('should fail when using "not" and the received bytes match the expected bytes', () => {
      const bytes = new Uint8Array([1, 2, 3, 4, 5]);

      expect(() => {
        expect(bytes).not.toHaveBytes([1, 2, 3, 4, 5]);
      }).toThrow(
        'Expected Bytes(1,2,3,4,5) not to have bytes Bytes(1,2,3,4,5)',
      );
    });
  });
});

describe('toHaveBytesFrom', () => {
  it('should pass when the received bytes match the expected bytes from the specified index', () => {
    const bytes = new Uint8Array([1, 2, 3, 4, 5]);

    expect(bytes).toHaveBytesFrom(2, [3, 4, 5]);
    expect(bytes).toHaveBytesFrom(3, [4, 5]);
    expect(bytes).toHaveBytesFrom(4, [5]);
  });

  it('should fail when the received bytes do not match the expected bytes from the specified index', () => {
    const bytes = new Uint8Array([1, 2, 3, 4, 5]);

    expect(() => {
      expect(bytes).toHaveBytesFrom(2, [4, 5]);
    }).toThrow(
      'Expected Bytes(1,2,3,4,5) to have bytes Bytes(4,5) from index 2 but got Bytes(3,4,5)',
    );
  });

  it('should fail when the received bytes are empty and the expected bytes are not', () => {
    const bytes = new Uint8Array([]);

    expect(() => {
      expect(bytes).toHaveBytesFrom(0, [1, 2, 3]);
    }).toThrow(
      'Expected empty bytes to have bytes Bytes(1,2,3) from index 0 but got empty bytes',
    );
  });

  it('should fail when using "not" and the received bytes match the expected bytes from the specified index', () => {
    const bytes = new Uint8Array([1, 2, 3, 4, 5]);

    expect(() => {
      expect(bytes).not.toHaveBytesFrom(2, [3, 4, 5]);
    }).toThrow(
      'Expected Bytes(1,2,3,4,5) not to have bytes Bytes(3,4,5) from index 2 but got Bytes(3,4,5)',
    );
  });
});
