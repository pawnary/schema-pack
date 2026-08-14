import { Unpackr } from 'msgpackr';
import { Decoder as MsgpackDecoder } from '@msgpack/msgpack';
import { MessagePackDecoder } from '@jsonjoy.com/json-pack/lib/msgpack/index.js';
import Decoder from '../src/decoder/decoder.ts';
import { SerializerBenchSuite } from '@schema-pack/benchmark';
import decoderDataTypesFactory from '../src/benchmark/decoderDataTypesFactory.ts';

// -- msgpackr --
const sharedMsgpackrUnpackr = new Unpackr({
  // keep same conditions for other decoders
  useRecords: false,
  useBigIntExtension: false,
  encodeUndefinedAsNil: true,
  mapsAsObjects: true,
});

const sharedMsgpackrUnpackrWithRecords = new Unpackr({
  useRecords: true,
});

// -- @msgpack/msgpack --
const sharedMsgpackDecoder = new MsgpackDecoder({
  // useBigInt64: true,
});

// -- @jsonjoy.com/json-pack --
const sharedJsonJoyMsgpackDecoder = new MessagePackDecoder();

// -- @schema-pack/message-pack --
const sharedSchemaPackDecoder = new Decoder();

const suite = new SerializerBenchSuite(decoderDataTypesFactory);

suite
  .add('msgpackr shared Unpackr.unpack (no records)', (value) =>
    sharedMsgpackrUnpackr.unpack(value),
  )
  .add(
    'msgpackr shared Unpackr.unpack (with records extension)',
    (value) => sharedMsgpackrUnpackrWithRecords.unpack(value),
    { only: ['fixmap', 'map16', 'map32'] },
  )
  .add('@msgpack/msgpack shared Decoder.decode', (value) =>
    sharedMsgpackDecoder.decode(value),
  )
  .add('@jsonjoy.com/json-pack shared MsgpackDecoder.decode', (value) =>
    sharedJsonJoyMsgpackDecoder.decode(value),
  )
  .add('@schema-pack/message-pack shared Decoder.decode', (value) =>
    sharedSchemaPackDecoder.decode(value),
  )
  .withDataType('fixmap')
  // .withDataType('fixstr')
  // .withDataType('str8')
  .run();
