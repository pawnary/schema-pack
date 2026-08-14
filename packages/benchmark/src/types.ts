import type { FnOptions } from 'tinybench';

export type DataTypeFactoryFn<T = unknown> = () => T;

export interface DataTypesFactory<T = unknown> {
  [key: string]: DataTypeFactoryFn<T>;
  [key: number]: never;
  [key: symbol]: never;
}

export type SerializerTaskOptions<TDataTypesFactory extends DataTypesFactory> =
  FnOptions & {
    skip?: (keyof TDataTypesFactory)[];
    only?: (keyof TDataTypesFactory)[];
  };

export type SerializerFn<T = unknown> = (value: T) => unknown;

export interface SerializerTask<TDataTypesFactory extends DataTypesFactory> {
  name: string;
  fn: SerializerFn<ReturnType<TDataTypesFactory[keyof TDataTypesFactory]>>;
  options?: SerializerTaskOptions<TDataTypesFactory>;
}
