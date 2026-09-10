import type MessagePackDecoder from '../../decoder/interfaces/messagePackDecoder.ts';
import type MessagePackExtensionBase from '../interfaces/messagePackExtensionBase.ts';
import type { Constructor } from '../interfaces/types.ts';
import type {
  SerializerExtensionFactories,
  SerializerExtensionFactory,
} from './types.ts';

abstract class SerializerExtension<
  TValue extends object,
  TInput,
  TFactory extends SerializerExtensionFactory<TValue, TInput>,
  TBuffer extends Uint8Array = Uint8Array,
> implements MessagePackExtensionBase<TValue, TBuffer> {
  abstract readonly type: number;
  readonly constructors: Constructor<TValue>[] = [];

  readonly factories = new Map<Constructor<TValue>, TFactory>();

  protected readonly factoriesByConstructorName = new Map<string, TFactory>();

  constructor(
    factories: SerializerExtensionFactories<TValue, TInput, TFactory>,
  ) {
    for (const [constructor, factory] of factories) {
      this.registerFactory(constructor, factory);
    }
  }

  protected registerFactory(
    construct: Constructor<TValue>,
    factory: TFactory,
  ): void {
    if (this.factories.has(construct)) {
      throw new Error(
        `Factory already registered for constructor: "${construct.name}"`,
      );
    }

    this.factories.set(construct, factory);
    this.constructors.push(construct);
    this.factoriesByConstructorName.set(construct.name, factory);
  }

  fetchFactoryByConstructor(constructor: Constructor<TValue>): TFactory {
    const factory = this.factories.get(constructor);

    if (!factory) {
      throw new Error(
        `No factory registered for constructor: "${constructor.name}"`,
      );
    }

    return factory;
  }

  fetchFactoryByConstructorName(constructorName: string): TFactory {
    const factory = this.factoriesByConstructorName.get(constructorName);

    if (!factory) {
      throw new Error(
        `No factory registered for constructor name: "${constructorName}"`,
      );
    }

    return factory;
  }

  abstract decode(decoder: MessagePackDecoder<TBuffer>, size: number): TValue;
}

export default SerializerExtension;
