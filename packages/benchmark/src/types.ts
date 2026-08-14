import type { FnOptions } from 'tinybench';

export type DataTypeFactoryFn<T extends any = unknown> = () => T;

export type DataTypesFactory<T extends any = unknown> = {
  [key: string]: DataTypeFactoryFn<T>;
  [key: number]: never;
  [key: symbol]: never;
};

export type SerializerTaskOptions<TDataTypesFactory extends DataTypesFactory> =
  FnOptions & {
    skip?: (keyof TDataTypesFactory)[];
    only?: (keyof TDataTypesFactory)[];
  };

export type SerializerFn<T extends any = unknown> = (value: T) => unknown;

export type SerializerTask<TDataTypesFactory extends DataTypesFactory> = {
  name: string;
  fn: SerializerFn<ReturnType<TDataTypesFactory[keyof TDataTypesFactory]>>;
  options?: SerializerTaskOptions<TDataTypesFactory>;
};
