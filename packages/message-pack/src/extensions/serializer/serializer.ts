import type MessagePackDecoder from '../../decoder/interfaces/messagePackDecoder.ts';
import type { ExtensionEncoder } from '../../encoder/types.ts';
import type MessagePackBuiltInExtension from '../interfaces/messagePackBuiltInExtension.ts';
import type { Constructor } from '../interfaces/types.ts';
import type {
  SerializerExtensionFactories,
  SerializerExtensionFactory,
} from './types.ts';

abstract class SerializerExtension<
  TValue extends object = object,
  TInput = unknown,
  TBuffer extends Uint8Array = Uint8Array,
> implements MessagePackBuiltInExtension<TValue, TBuffer> {
  abstract readonly type: number;
  readonly constructors: Constructor<TValue>[] = [];

  readonly factories = new Map<
    Constructor<TValue>,
    SerializerExtensionFactory<TValue, TInput>
  >();

  protected readonly factoriesByConstructorName = new Map<
    string,
    SerializerExtensionFactory<TValue, TInput>
  >();

  constructor(factories: SerializerExtensionFactories<TValue, TInput>) {
    for (const [constructor, factory] of factories) {
      this.registerFactory(constructor, factory);
    }
  }

  registerFactory(
    construct: Constructor<TValue>,
    factory: SerializerExtensionFactory<TValue, TInput>,
  ): void {
    this.factories.set(construct, factory);
    this.constructors.push(construct);
    this.factoriesByConstructorName.set(construct.name, factory);
  }

  fetchFactoryByConstructor(
    constructor: Constructor<TValue>,
  ): SerializerExtensionFactory<TValue, TInput> {
    const factory = this.factories.get(constructor);

    if (!factory) {
      throw new Error(
        `No factory registered for constructor: "${constructor.name}"`,
      );
    }

    return factory;
  }

  fetchFactoryByConstructorName(
    constructorName: string,
  ): SerializerExtensionFactory<TValue, TInput> {
    const factory = this.factoriesByConstructorName.get(constructorName);

    if (!factory) {
      throw new Error(
        `No factory registered for constructor name: "${constructorName}"`,
      );
    }

    return factory;
  }

  abstract encodeInto(
    value: InstanceType<Constructor<TValue>>,
    encoder: ExtensionEncoder<TBuffer>,
  ): void;

  abstract decode(decoder: MessagePackDecoder<TBuffer>, size: number): TValue;
}

export default SerializerExtension;
