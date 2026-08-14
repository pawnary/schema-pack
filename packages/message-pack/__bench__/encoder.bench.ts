import { Packr } from 'msgpackr';
import { Encoder as MsgpackEncoder } from '@msgpack/msgpack';
import { MessagePackEncoder } from '@jsonjoy.com/json-pack/lib/msgpack/index.js';
import Encoder from '../src/encoder/encoder.ts';
import { SerializerBenchSuite, dataTypesFactory } from '@schema-pack/benchmark';

// -- msgpackr --
const sharedMsgpackrPackr = new Packr({
  useBigIntExtension: true,
});

// -- @msgpack/msgpack --
const sharedMsgpackEncoder = new MsgpackEncoder({
  useBigInt64: true,
});

// -- @jsonjoy.com/json-pack --
const sharedJsonJoyMsgpackEncoder = new MessagePackEncoder();

// -- @schema-pack/message-pack --
const sharedSchemaPackEncoder = new Encoder();

// benchmarks
const suite = new SerializerBenchSuite(dataTypesFactory);

suite
  .add('msgpackr shared Packr.pack', (value) => sharedMsgpackrPackr.pack(value))
  .add('@msgpack/msgpack shared encoder', (value) =>
    sharedMsgpackEncoder.encode(value),
  )
  .add('@jsonjoy.com/json-pack shared encoder', (value) =>
    sharedJsonJoyMsgpackEncoder.encode(value),
  )
  .add('@schema-pack/message-pack shared Encoder.encode', (value) =>
    sharedSchemaPackEncoder.encode(value),
  )
  .run();
