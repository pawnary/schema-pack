// oxlint-disable max-classes-per-file
import { describe, expect, it, vi } from 'vitest';

import BufferWithExtensions from '../../src/bufferWithExtensions.ts';
import ErrorExtension from '../../src/extensions/error/error.ts';
import type {
  ErrorExtensionFactory,
  ErrorExtensionFactoryInput,
} from '../../src/extensions/error/types.ts';
import type MessagePackBuiltInExtension from '../../src/extensions/interfaces/messagePackBuiltInExtension.ts';
import type MessagePackExtension from '../../src/extensions/interfaces/messagePackExtension.ts';
import TimestampDateExtension from '../../src/extensions/timestampDate/timestampDate.ts';

class MockWithExtensions extends BufferWithExtensions {
  getBuiltInExtensions(): Map<number, MessagePackBuiltInExtension> {
    return this.builtInExtensions;
  }
}

describe('constructor options', () => {
  it('should disable all built-in extensions', () => {
    const mock = new MockWithExtensions({
      extensions: false,
    });

    expect(mock.bigIntExtension).toBeUndefined();
    expect(mock.errorExtension).toBeUndefined();
    expect(mock.timestampDateExtension).toBeUndefined();
    expect(mock.getBuiltInExtensions().size).toBe(0);
  });

  describe('bigInt built-in extension', () => {
    it('should disable the extension', () => {
      const mock = new MockWithExtensions({
        extensions: {
          bigInt: false,
        },
      });

      expect(mock.bigIntExtension).toBeUndefined();
      expect(mock.errorExtension).toBeDefined();
      expect(mock.timestampDateExtension).toBeDefined();
    });

    it('should fails when extension type is not between -128 and 127', () => {
      expect(
        () =>
          new MockWithExtensions({
            extensions: {
              bigInt: {
                type: 128,
              },
            },
          }),
      ).toThrow('Extension type must be in the range -128 to 127, got 128');
    });

    it('should assign correctly a new extension type', () => {
      const mock = new MockWithExtensions({
        extensions: {
          bigInt: {
            type: 123,
          },
        },
      });

      expect(mock.bigIntExtension).toBeDefined();
      expect(mock.bigIntExtension?.type).toBe(123);
    });
  });

  describe('error built-in extension', () => {
    it('should disable the extension', () => {
      const mock = new MockWithExtensions({
        extensions: {
          error: false,
        },
      });

      expect(mock.bigIntExtension).toBeDefined();
      expect(mock.errorExtension).toBeUndefined();
      expect(mock.timestampDateExtension).toBeDefined();
    });

    it('should assign new extensions options', () => {
      // oxlint-disable-next-line unicorn/custom-error-definition
      class NewError extends Error {}

      const factory: ErrorExtensionFactory = (
        input: ErrorExtensionFactoryInput,
      ): NewError => new NewError(input.message, input.options);

      const mock = new MockWithExtensions({
        extensions: {
          error: {
            factories: [[NewError, factory]],
            type: 123,
          },
        },
      });

      expect(mock.errorExtension).toBeDefined();
      expect(mock.errorExtension?.type).toBe(123);
      expect(mock.errorExtension?.factories.get(NewError)).toBe(factory);
      expect(mock.getBuiltInExtensions().get(123)).toBe(mock.errorExtension);
    });

    it('should fails when type config is not between -128 and 127', () => {
      expect(
        () =>
          new MockWithExtensions({
            extensions: {
              error: {
                type: 128,
              },
            },
          }),
      ).toThrow('Extension type must be in the range -128 to 127, got 128');
    });

    it('should use provided error extension', () => {
      const errorExtension = new ErrorExtension({
        type: 123,
      });

      const mock = new MockWithExtensions({
        extensions: {
          error: errorExtension,
        },
      });

      expect(mock.errorExtension).toBe(errorExtension);
      expect(mock.getBuiltInExtensions().get(123)).toBe(errorExtension);
    });

    it('should fails when provided error extension type is not between -128 and 127', () => {
      const errorExtension = new ErrorExtension({
        type: 128,
      });

      expect(
        () =>
          new MockWithExtensions({
            extensions: {
              error: errorExtension,
            },
          }),
      ).toThrow('Extension type must be in the range -128 to 127, got 128');
    });
  });

  describe('timestampDate built-in extension', () => {
    it('should disable the extension', () => {
      const mock = new MockWithExtensions({
        extensions: {
          timestampDate: false,
        },
      });

      expect(mock.bigIntExtension).toBeDefined();
      expect(mock.errorExtension).toBeDefined();
      expect(mock.timestampDateExtension).toBeUndefined();
      expect(
        mock.getBuiltInExtensions().get(TimestampDateExtension.DEFAULT_TYPE),
      ).toBeUndefined();
    });

    it('should use provided timestampDate extension', () => {
      const timestampDateExtension = new TimestampDateExtension();

      const mock = new MockWithExtensions({
        extensions: {
          timestampDate: timestampDateExtension,
        },
      });

      expect(mock.timestampDateExtension).toBe(timestampDateExtension);
      expect(
        mock.getBuiltInExtensions().get(TimestampDateExtension.DEFAULT_TYPE),
      ).toBe(timestampDateExtension);
    });
  });
});

describe('addExtension', () => {
  it('should fails when adding an extension with a duplicate type', () => {
    const mock = new MockWithExtensions({
      extensions: false,
    });

    const extension: MessagePackExtension = {
      constructors: [],
      decode: vi.fn<() => object>(),
      encode: vi.fn<() => void>(),
      type: 123,
    };

    mock.addExtension(extension);

    // Object is the default constructor name for plan objects ("{}").
    expect(() => mock.addExtension(extension)).toThrow(
      'Extension with type 123 already registered for Object',
    );
  });

  it('should throw an error if the extension type has a value that is not between -128 and 127', () => {
    const mock = new MockWithExtensions({
      extensions: false,
    });

    const tooSmallExtension: MessagePackExtension = {
      constructors: [],
      decode: vi.fn<() => object>(),
      encode: vi.fn<() => void>(),
      type: -129,
    };

    const tooLargeExtension: MessagePackExtension = {
      constructors: [],
      decode: vi.fn<() => object>(),
      encode: vi.fn<() => void>(),
      type: 128,
    };

    expect(() => mock.addExtension(tooSmallExtension)).toThrow(
      'Extension type must be in the range -128 to 127, got -129',
    );

    expect(() => mock.addExtension(tooLargeExtension)).toThrow(
      'Extension type must be in the range -128 to 127, got 128',
    );
  });

  it('should throw an error if the extension type conflicts with a built-in extension', () => {
    const mock = new MockWithExtensions();

    const conflictingExtension: MessagePackExtension = {
      constructors: [],
      decode: vi.fn<() => object>(),
      encode: vi.fn<() => void>(),
      type: TimestampDateExtension.DEFAULT_TYPE,
    };

    expect(() => mock.addExtension(conflictingExtension)).toThrow(
      `Extension with type ${TimestampDateExtension.DEFAULT_TYPE} conflicts with built-in extension TimestampDateExtension`,
    );
  });

  it('should throw an error if the extension type conflicts with bigint extension', () => {
    const mock = new MockWithExtensions({
      extensions: {
        bigInt: {
          type: 123,
        },
      },
    });

    const conflictingExtension: MessagePackExtension = {
      constructors: [],
      decode: vi.fn<() => object>(),
      encode: vi.fn<() => void>(),
      type: 123,
    };

    expect(() => mock.addExtension(conflictingExtension)).toThrow(
      'Extension with type 123 conflicts with built-in BigInt extension',
    );
  });

  it('should add an extension correctly', () => {
    const mock = new MockWithExtensions();

    expect(mock.getExtensions().has(123)).toBe(false);
    expect(mock.getBuiltInExtensions().has(123)).toBe(false);

    const extension: MessagePackExtension = {
      constructors: [],
      decode: vi.fn<() => object>(),
      encode: vi.fn<() => void>(),
      type: 123,
    };

    mock.addExtension(extension);

    expect(mock.fetchExtension(123)).toBe(extension);
  });
});

describe('fetchExtension', () => {
  it('should get a built-in extension', () => {
    const mock = new MockWithExtensions();

    const extension = mock.fetchExtension(TimestampDateExtension.DEFAULT_TYPE);

    expect(extension).toBeDefined();
    expect(extension?.type).toBe(TimestampDateExtension.DEFAULT_TYPE);
  });

  it('should get a user-defined extension', () => {
    const mock = new MockWithExtensions();

    const extension: MessagePackExtension = {
      constructors: [],
      decode: vi.fn<() => object>(),
      encode: vi.fn<() => void>(),
      type: 123,
    };

    mock.addExtension(extension);

    const fetchedExtension = mock.fetchExtension(123);

    expect(fetchedExtension).toBeDefined();
    expect(fetchedExtension).toBe(extension);
  });

  it('should fails to get a non-existent extension', () => {
    const mock = new MockWithExtensions();

    expect(mock.getBuiltInExtensions().has(999)).toBe(false);
    expect(mock.getExtensions().has(999)).toBe(false);

    expect(() => mock.fetchExtension(999)).toThrow(
      'Extension with type 999 not found',
    );
  });
});
