import type { Constructor } from '../interfaces/types.ts';

export type SerializerExtensionFactory<
  TValue extends object,
  TInput = unknown,
> = (input: TInput) => InstanceType<Constructor<TValue>>;

export type SerializerExtensionFactories<
  TValue extends object = object,
  TInput = unknown,
> = [
  Constructor<TValue>,
  SerializerExtensionFactory<InstanceType<Constructor<TValue>>, TInput>,
][];
