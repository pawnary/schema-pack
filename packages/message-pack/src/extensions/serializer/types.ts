import type { Constructor } from '../interfaces/types.ts';

export type SerializerExtensionFactory<TValue extends object, TInput> = (
  input: TInput,
) => InstanceType<Constructor<TValue>>;

export type SerializerExtensionFactories<
  TValue extends object,
  TInput,
  TFactory extends SerializerExtensionFactory<TValue, TInput>,
> = [Constructor<TValue>, TFactory][];
