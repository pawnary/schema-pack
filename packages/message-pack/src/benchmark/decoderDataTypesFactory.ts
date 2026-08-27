import { dataTypesFactory } from '@schema-pack/benchmark';

import Encoder from '../encoder/encoder.ts';

const encoder = new Encoder();

const decoderDataTypesFactory: Record<
  keyof typeof dataTypesFactory,
  () => Uint8Array
> = {
  array16: () => encoder.write(dataTypesFactory.array16()).flush(),
  array32: () => encoder.write(dataTypesFactory.array32()).flush(),
  // bigint: () => encoder.write(dataTypesFactory.bigint()).flush(),
  bin16: () => encoder.write(dataTypesFactory.bin16()).flush(),
  bin32: () => encoder.write(dataTypesFactory.bin32()).flush(),
  bin8: () => encoder.write(dataTypesFactory.bin8()).flush(),
  false: () => encoder.write(dataTypesFactory.false()).flush(),
  fixarray: () => encoder.write(dataTypesFactory.fixarray()).flush(),
  fixmap: () => encoder.write(dataTypesFactory.fixmap()).flush(),
  fixstr: () => encoder.write(dataTypesFactory.fixstr()).flush(),
  float32: () => encoder.write(dataTypesFactory.float32()).flush(),
  float64: () => encoder.write(dataTypesFactory.float64()).flush(),
  int16: () => encoder.write(dataTypesFactory.int16()).flush(),
  int32: () => encoder.write(dataTypesFactory.int32()).flush(),
  int64: () => encoder.write(dataTypesFactory.int64()).flush(),
  int8: () => encoder.write(dataTypesFactory.int8()).flush(),
  map16: () => encoder.write(dataTypesFactory.map16()).flush(),
  map32: () => encoder.write(dataTypesFactory.map32()).flush(),
  negativeFixint: () =>
    encoder.write(dataTypesFactory.negativeFixint()).flush(),
  nil: () => encoder.write(dataTypesFactory.nil()).flush(),
  positiveFixint: () =>
    encoder.write(dataTypesFactory.positiveFixint()).flush(),
  str16: () => encoder.write(dataTypesFactory.str16()).flush(),
  str32: () => encoder.write(dataTypesFactory.str32()).flush(),
  str8: () => encoder.write(dataTypesFactory.str8()).flush(),
  true: () => encoder.write(dataTypesFactory.true()).flush(),
  uint16: () => encoder.write(dataTypesFactory.uint16()).flush(),
  uint32: () => encoder.write(dataTypesFactory.uint32()).flush(),
  uint64: () => encoder.write(dataTypesFactory.uint64()).flush(),
  uint8: () => encoder.write(dataTypesFactory.uint8()).flush(),
  // oxlint-disable-next-line typescript/no-confusing-void-expression
  undefined: () => encoder.write(dataTypesFactory.undefined()).flush(),
};

export default decoderDataTypesFactory;
