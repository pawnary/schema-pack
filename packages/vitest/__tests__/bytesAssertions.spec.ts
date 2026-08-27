import { describe, expect, it } from 'vitest';

describe('toBeByteAt', () => {
  it('should pass when the byte at the specified index matches the expected byte', () => {
    const buffer = new Uint8Array([1, 2, 3, 4, 5]);

    expect(buffer).toBeByteAt(2, 3);
  });

  it('should fail when the byte at the specified index does not match the expected byte', () => {
    const buffer = new Uint8Array([1, 2, 3, 4, 5]);

    expect(() => {
      expect(buffer).toBeByteAt(2, 4);
    }).toThrow('Expected Bytes(1,2,3,4,5) to have byte 4 at index 2 but got 3');
  });

  it('should fail when the index is out of bounds', () => {
    const buffer = new Uint8Array([1, 2, 3, 4, 5]);

    expect(() => {
      expect(buffer).toBeByteAt(5, 6);
    }).toThrow(
      'Expected Bytes(1,2,3,4,5) to have byte 6 at index 5 but got undefined',
    );
  });

  it('should fail when using "not" and the byte at the specified index matches the expected byte', () => {
    const buffer = new Uint8Array([1, 2, 3, 4, 5]);

    expect(() => {
      expect(buffer).not.toBeByteAt(2, 3);
    }).toThrow(
      'Expected Bytes(1,2,3,4,5) not to have byte 3 at index 2 but got 3',
    );
  });
});

describe('toBeBytes', () => {
  it('should pass when the received bytes match the expected bytes', () => {
    const buffer = new Uint8Array([1, 2, 3, 4, 5]);

    expect(buffer).toBeBytes([1, 2, 3, 4, 5]);
  });

  it('should fail when the received bytes do not match the expected bytes', () => {
    const buffer = new Uint8Array([1, 2, 3, 4, 5]);

    expect(() => {
      expect(buffer).toBeBytes([1, 2, 3, 4]);
    }).toThrow(
      'Expected Bytes(1,2,3,4,5) to be bytes Bytes(1,2,3,4) but missing bytes Bytes(5)',
    );
  });

  it('should fail when the expected bytes are larger than the received bytes', () => {
    const buffer = new Uint8Array([1, 2, 3]);

    expect(() => {
      expect(buffer).toBeBytes([1, 2, 3, 4, 5]);
    }).toThrow(
      'Expected Bytes(1,2,3) to be bytes Bytes(1,2,3,4,5) but missing bytes Bytes(4,5)',
    );
  });

  it('should fail when using "not" and the received bytes match the expected bytes', () => {
    const buffer = new Uint8Array([1, 2, 3, 4, 5]);

    expect(() => {
      expect(buffer).not.toBeBytes([1, 2, 3, 4, 5]);
    }).toThrow('Expected Bytes(1,2,3,4,5) not to be bytes Bytes(1,2,3,4,5)');
  });
});

describe('toBeBytesBetween', () => {
  it('should pass when the bytes between the specified indices match the expected bytes', () => {
    const buffer = new Uint8Array([1, 2, 3, 4, 5]);

    expect(buffer).toBeBytesBetween(1, 3, [2, 3, 4]);
  });

  it('should fail when the bytes between the specified indices do not match the expected bytes', () => {
    const buffer = new Uint8Array([1, 2, 3, 4, 5]);

    expect(() => {
      expect(buffer).toBeBytesBetween(1, 3, [2, 3, 5]);
    }).toThrow(
      'Expected Bytes(1,2,3,4,5) to be bytes Bytes(2,3,5) between index 1 and 3 but got Bytes(2,3,4)',
    );
  });
});

describe('toBeBytesLength', () => {
  it('should pass when the bytes length matches the expected length', () => {
    const buffer = new Uint8Array([1, 2, 3, 4, 5]);

    expect(buffer).toBeBytesLength(5);
  });

  it('should fail when the bytes length does not match the expected length', () => {
    const buffer = new Uint8Array([1, 2, 3, 4, 5]);

    expect(() => {
      expect(buffer).toBeBytesLength(4);
    }).toThrow('Expected Bytes(1,2,3,4,5) to have bytes length 4 but got 5');
  });

  it('should fail when using "not" and the bytes length matches the expected length', () => {
    const buffer = new Uint8Array([1, 2, 3, 4, 5]);

    expect(() => {
      expect(buffer).not.toBeBytesLength(5);
    }).toThrow(
      'Expected Bytes(1,2,3,4,5) not to have bytes length 5 but got 5',
    );
  });
});

describe('toContainBytes', () => {
  describe('match', () => {
    it('should pass when the received bytes match the expected bytes', () => {
      const buffer = new Uint8Array([1, 2, 3, 4, 5]);

      expect(buffer).toContainBytes([1, 2, 3, 4, 5]);
      expect(buffer).toContainBytes([1, 2, 3, 4]);
      expect(buffer).toContainBytes([1, 2, 3]);
      expect(buffer).toContainBytes([1, 2]);
      expect(buffer).toContainBytes([1]);
    });

    it('should pass when the received bytes do not match the expected bytes', () => {
      const buffer = new Uint8Array([1, 2, 3, 4, 5]);

      expect(buffer).not.toContainBytes([4, 5, 6, 7]);
    });
  });

  describe('not match', () => {
    it('should fail when the received bytes do not match the expected bytes', () => {
      const buffer = new Uint8Array([1, 2, 3, 4, 5]);

      expect(() => {
        expect(buffer).toContainBytes([4, 5, 6, 7]);
      }).toThrow('Expected Bytes(1,2,3,4,5) to have bytes Bytes(4,5,6,7)');
    });

    it('should fail when the received bytes are empty and the expected bytes are not', () => {
      const buffer = new Uint8Array([]);

      expect(() => {
        expect(buffer).toContainBytes([1, 2, 3]);
      }).toThrow('Expected empty Bytes() to have bytes Bytes(1,2,3)');
    });

    it('should fail when using "not" and the received bytes match the expected bytes', () => {
      const buffer = new Uint8Array([1, 2, 3, 4, 5]);

      expect(() => {
        expect(buffer).not.toContainBytes([1, 2, 3, 4, 5]);
      }).toThrow(
        'Expected Bytes(1,2,3,4,5) not to have bytes Bytes(1,2,3,4,5)',
      );
    });
  });
});

describe('toContainBytesFrom', () => {
  it('should pass when the received bytes match the expected bytes from the specified index', () => {
    const buffer = new Uint8Array([1, 2, 3, 4, 5]);

    expect(buffer).toContainBytesFrom(2, [3, 4, 5]);
    expect(buffer).toContainBytesFrom(3, [4, 5]);
    expect(buffer).toContainBytesFrom(4, [5]);
  });

  it('should fail when the received bytes do not match the expected bytes from the specified index', () => {
    const buffer = new Uint8Array([1, 2, 3, 4, 5]);

    expect(() => {
      expect(buffer).toContainBytesFrom(2, [4, 5]);
    }).toThrow(
      'Expected Bytes(1,2,3,4,5) to have bytes Bytes(4,5) from index 2 but got Bytes(3,4,5)',
    );
  });

  it('should fail when the received bytes are empty and the expected bytes are not', () => {
    const buffer = new Uint8Array([]);

    expect(() => {
      expect(buffer).toContainBytesFrom(0, [1, 2, 3]);
    }).toThrow(
      'Expected empty Bytes() to have bytes Bytes(1,2,3) from index 0 but got empty Bytes()',
    );
  });

  it('should fail when using "not" and the received bytes match the expected bytes from the specified index', () => {
    const buffer = new Uint8Array([1, 2, 3, 4, 5]);

    expect(() => {
      expect(buffer).not.toContainBytesFrom(2, [3, 4, 5]);
    }).toThrow(
      'Expected Bytes(1,2,3,4,5) not to have bytes Bytes(3,4,5) from index 2 but got Bytes(3,4,5)',
    );
  });
});

describe('buffer types', () => {
  describe('unsigned', () => {
    it('should works with JavaScript `Uint8Array`', () => {
      const buffer = new Uint8Array([1, 2, 3, 4, 5]);

      expect(buffer).toBeBytesLength(5);
      expect(buffer).toBeBytes(new Uint8Array([1, 2, 3, 4, 5]));
    });

    it('should works with JavaScript `Uint8ClampedArray`', () => {
      const buffer = new Uint8ClampedArray([1, 2, 3, 4, 5]);

      expect(buffer).toBeBytesLength(5);
      expect(buffer).toBeBytes(new Uint8ClampedArray([1, 2, 3, 4, 5]));
    });

    it('should works with JavaScript `Uint16Array`', () => {
      const buffer = new Uint16Array([1, 2, 3, 4, 5]);

      expect(buffer).toBeBytesLength(5);
      expect(buffer).toBeBytes(new Uint16Array([1, 2, 3, 4, 5]));
    });

    it('should works with JavaScript `Uint32Array`', () => {
      const buffer = new Uint32Array([1, 2, 3, 4, 5]);

      expect(buffer).toBeBytesLength(5);
      expect(buffer).toBeBytes(new Uint32Array([1, 2, 3, 4, 5]));
    });
  });

  describe('signed', () => {
    it('should works with JavaScript `Int8Array`', () => {
      const buffer = new Int8Array([-5, -4, -3, -2, -1]);

      expect(buffer).toBeBytesLength(5);
      expect(buffer).toBeBytes(new Int8Array([-5, -4, -3, -2, -1]));
    });

    it('should works with JavaScript `Int16Array`', () => {
      const buffer = new Int16Array([-5, -4, -3, -2, -1]);

      expect(buffer).toBeBytesLength(5);
      expect(buffer).toBeBytes(new Int16Array([-5, -4, -3, -2, -1]));
    });

    it('should works with JavaScript `Int32Array`', () => {
      const buffer = new Int32Array([-5, -4, -3, -2, -1]);

      expect(buffer).toBeBytesLength(5);
      expect(buffer).toBeBytes(new Int32Array([-5, -4, -3, -2, -1]));
    });
  });

  describe('floating point', () => {
    it('should works with JavaScript `Float32Array`', () => {
      const buffer = new Float32Array([1.1, 2.2, 3.3, 4.4, 5.5]);

      expect(buffer).toBeBytesLength(5);
      expect(buffer).toBeBytes(new Float32Array([1.1, 2.2, 3.3, 4.4, 5.5]));
    });

    it('should works with JavaScript `Float64Array`', () => {
      const buffer = new Float64Array([1.1, 2.2, 3.3, 4.4, 5.5]);

      expect(buffer).toBeBytesLength(5);
      expect(buffer).toBeBytes(new Float64Array([1.1, 2.2, 3.3, 4.4, 5.5]));
    });
  });

  describe('bigint', () => {
    it('should works with JavaScript `BigInt64Array`', () => {
      const buffer = new BigInt64Array([-5n, -4n, -3n, -2n, -1n]);

      expect(buffer).toBeBytesLength(5);
      expect(buffer).toBeBytes(new BigInt64Array([-5n, -4n, -3n, -2n, -1n]));
    });

    it('should works with JavaScript `BigUint64Array`', () => {
      const buffer = new BigUint64Array([1n, 2n, 3n, 4n, 5n]);

      expect(buffer).toBeBytesLength(5);
      expect(buffer).toBeBytes(new BigUint64Array([1n, 2n, 3n, 4n, 5n]));
    });
  });

  it('should works with numeric array `number[]`', () => {
    const buffer = [1, 2, 3, 4, 5];

    expect(buffer).toBeBytesLength(5);
    expect(buffer).toBeBytes([1, 2, 3, 4, 5]);
  });

  it('should works with Node.js `Buffer`', () => {
    const buffer = Buffer.from([1, 2, 3, 4, 5]);

    expect(buffer).toBeBytesLength(5);
    expect(buffer).toBeBytes(Buffer.from([1, 2, 3, 4, 5]));
  });
});
