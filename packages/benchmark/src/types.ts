import type { BenchOptions, FnOptions } from 'tinybench';

export type DataTypeFactoryFn<TValue = unknown> = () => TValue;

export interface DataTypesFactory<TValue = unknown> {
  [key: string]: DataTypeFactoryFn<TValue>;
  [key: number]: never;
  [key: symbol]: never;
}

export type SerializerTaskOptions<TDataTypesFactory extends DataTypesFactory> =
  FnOptions & {
    skip?: (keyof TDataTypesFactory)[];
    only?: (keyof TDataTypesFactory)[];
  };

export type SerializerFn<TValue = unknown> = (value: TValue) => unknown;

export interface SerializerTask<TDataTypesFactory extends DataTypesFactory> {
  name: string;
  fn: SerializerFn<ReturnType<TDataTypesFactory[keyof TDataTypesFactory]>>;
  options?: SerializerTaskOptions<TDataTypesFactory>;
}

export type SerializerDataTypeBenchOptions<
  TDataTypesFactory extends DataTypesFactory,
  TDataType extends keyof TDataTypesFactory,
> = BenchOptions & {
  dataType: TDataType;
  dataTypeFactory: TDataTypesFactory[TDataType] | DataTypeFactoryFn;
  tasks: Map<string, SerializerTask<TDataTypesFactory>>;
};
