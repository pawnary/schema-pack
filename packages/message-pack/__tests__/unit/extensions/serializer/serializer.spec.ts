import { describe, expect, it, test } from 'vitest';

import type MessagePackDecoder from '../../../../src/decoder/interfaces/messagePackDecoder.ts';
import type { ExtensionEncoder } from '../../../../src/encoder/types.ts';
import type { Constructor } from '../../../../src/extensions/interfaces/types.ts';
import SerializerExtension from '../../../../src/extensions/serializer/serializer.ts';
import type { SerializerExtensionFactory } from '../../../../src/extensions/serializer/types.ts';

class SerializerExtensionMock extends SerializerExtension<
  object,
  never,
  SerializerExtensionFactory<object, never>
> {
  readonly type = 123;

  encodeInto(): void {
    throw new Error('not implemented');
  }

  decode(): object {
    throw new Error('not implemented');
  }

  public override registerFactory(
    construct: Constructor<object>,
    factory: SerializerExtensionFactory<object, never>,
  ): void {
    super.registerFactory(construct, factory);
  }
}

const factory = (): object => ({});

test('constructor factories', () => {
  const extension = new SerializerExtensionMock([[Object, factory]]);

  expect(extension.factories.size).toBe(1);
  expect(extension.factories.get(Object)).toBe(factory);
});

describe('registerFactory', () => {
  it('should register a factory correctly', () => {
    const extension = new SerializerExtensionMock([]);

    expect(extension.factories.size).toBe(0);

    extension.registerFactory(Object, factory);

    expect(extension.factories.size).toBe(1);
    expect(extension.factories.get(Object)).toBe(factory);
  });

  it('should fails when a constructor is already registered', () => {
    const extension = new SerializerExtensionMock([]);

    extension.registerFactory(Object, factory);

    expect(() => {
      extension.registerFactory(Object, factory);
    }).toThrow('Factory already registered for constructor: "Object"');
  });
});

describe('fetchFactoryByConstructor', () => {
  it('should fails when a constructor is not registered', () => {
    const extension = new SerializerExtensionMock([]);

    expect(() => {
      extension.fetchFactoryByConstructor(Object);
    }).toThrow('No factory registered for constructor: "Object"');
  });

  it('should fetch the factory correctly', () => {
    const extension = new SerializerExtensionMock([]);

    extension.registerFactory(Object, factory);

    const fetchedFactory = extension.fetchFactoryByConstructor(Object);

    expect(fetchedFactory).toBe(factory);
  });
});

describe('fetchFactoryByConstructorName', () => {
  it('should fails when a constructor name is not registered', () => {
    const extension = new SerializerExtensionMock([]);

    expect(() => {
      extension.fetchFactoryByConstructorName({}.constructor.name);
    }).toThrow('No factory registered for constructor name: "Object"');
  });

  it('should fetch the factory correctly by constructor name', () => {
    const extension = new SerializerExtensionMock([]);

    extension.registerFactory(Object, factory);

    const fetchedFactory = extension.fetchFactoryByConstructorName(
      {}.constructor.name,
    );

    expect(fetchedFactory).toBe(factory);
  });
});
