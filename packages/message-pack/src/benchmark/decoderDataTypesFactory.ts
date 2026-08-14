import { dataTypesFactory } from '@schema-pack/benchmark';
import Encoder from '../encoder/encoder.ts';

const encoder = new Encoder();

const decoderDataTypesFactory: Record<
  keyof typeof dataTypesFactory,
  () => Uint8Array
> = {
  array16: () => encoder.encode(dataTypesFactory.array16()),
  array32: () => encoder.encode(dataTypesFactory.array32()),
  // bigint: () => encoder.encode(dataTypesFactory.bigint()),
  bin16: () => encoder.encode(dataTypesFactory.bin16()),
  bin32: () => encoder.encode(dataTypesFactory.bin32()),
  bin8: () => encoder.encode(dataTypesFactory.bin8()),
  false: () => encoder.encode(dataTypesFactory.false()),
  fixarray: () => encoder.encode(dataTypesFactory.fixarray()),
  fixmap: () => encoder.encode(dataTypesFactory.fixmap()),
  fixstr: () => encoder.encode(dataTypesFactory.fixstr()),
  float32: () => encoder.encode(dataTypesFactory.float32()),
  float64: () => encoder.encode(dataTypesFactory.float64()),
  int16: () => encoder.encode(dataTypesFactory.int16()),
  int32: () => encoder.encode(dataTypesFactory.int32()),
  int64: () => encoder.encode(dataTypesFactory.int64()),
  int8: () => encoder.encode(dataTypesFactory.int8()),
  map16: () => encoder.encode(dataTypesFactory.map16()),
  map32: () => encoder.encode(dataTypesFactory.map32()),
  negativeFixint: () => encoder.encode(dataTypesFactory.negativeFixint()),
  nil: () => encoder.encode(dataTypesFactory.nil()),
  positiveFixint: () => encoder.encode(dataTypesFactory.positiveFixint()),
  str16: () => encoder.encode(dataTypesFactory.str16()),
  str32: () => encoder.encode(dataTypesFactory.str32()),
  str8: () => encoder.encode(dataTypesFactory.str8()),
  true: () => encoder.encode(dataTypesFactory.true()),
  uint16: () => encoder.encode(dataTypesFactory.uint16()),
  uint32: () => encoder.encode(dataTypesFactory.uint32()),
  uint64: () => encoder.encode(dataTypesFactory.uint64()),
  uint8: () => encoder.encode(dataTypesFactory.uint8()),
  undefined: () => encoder.encode(dataTypesFactory.undefined()),
};

export default decoderDataTypesFactory;
