import type { FnOptions } from 'tinybench';

import type BenchAdapter from './instrumentedBench/adapters/benchAdapter.ts';
import type { InstrumentedBenchOptions } from './instrumentedBench/types.ts';

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

export interface SetupFnResult<
  TValue = unknown,
  TBuffer extends Uint8Array = Uint8Array,
> {
  encodeFn(value: TValue): TBuffer;
  decodeFn(value: TBuffer): TValue;
}

export interface Serializer<
  TDataTypesFactory extends DataTypesFactory,
  TValue = unknown,
  TBuffer extends Uint8Array = Uint8Array,
> {
  name: string;
  setup(): Promise<SetupFnResult<TValue, TBuffer>>;
  options?: FnOptions & {
    skip?: (keyof TDataTypesFactory)[];
    only?: (keyof TDataTypesFactory)[];
  };
}

export type SerializersDataTypeBenchOptions<
  TDataTypesFactory extends DataTypesFactory,
  TDataType extends keyof TDataTypesFactory,
> = Omit<InstrumentedBenchOptions, 'name'> & {
  dataType: TDataType;
  dataTypeFactory: TDataTypesFactory[TDataType] | DataTypeFactoryFn;
  serializers: Map<string, Serializer<TDataTypesFactory>>;
  disableGarbageCollection?: boolean;
};

export interface SerializersBenchSuiteOptions<
  TDataTypesFactory extends DataTypesFactory,
> {
  dataTypesFactory: TDataTypesFactory;
  adapter?: BenchAdapter;
}
