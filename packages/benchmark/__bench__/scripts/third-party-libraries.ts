import { encode, Encoder as MessagePackEncoder } from '@msgpack/msgpack';
import {
  Encoder,
  ExtensionCodec,
  SchemaPackEncoder,
} from '@schema-pack/msgpack';
import { pack, Packr } from 'msgpackr';
import { Bench } from 'tinybench';

import mocks from '../../../../src/mocks.ts';
import runGarbageCollector from '../utils/runGarbageCollector.ts';

(async () => {
  const bench = new Bench({
    name: 'Third-party libraries',
    time: 1000,
    throws: true,
    setup: () => {
      runGarbageCollector();
    },
  });

  // const mocks = [
  //   [39, 1024, 39, 1033],
  //   [39, 1024, 1033],
  // ];

  bench.add('@msgpack/msgpack raw', () => {
    encode(mocks);
  });

  // const extensionCodec = new ExtensionCodec<MessagePackEncoder>();

  // const messagePackEncoder = new MessagePackEncoder<MessagePackEncoder>({
  //   extensionCodec,
  // });

  // messagePackEncoder.encode(mocks);
  // const schemaPackEncoder = new SchemaPackEncoder();

  // bench.add('SchemaPackEncoder', () => {
  //   schemaPackEncoder.encode(mocks);
  // });

  const extensionCodec = new ExtensionCodec();

  bench.add('@msgpack/msgpack with extension codec', () => {
    encode(mocks, {
      extensionCodec,
    });
  });

  bench.add('msgpackr raw', () => {
    pack(mocks);
  });

  const packr = new Packr({
    getStructures() {
      return [
        ['trackingId', 'version', 'environmentId', 'events'],
        ['type', 'data', 'timestamp', 'id', 'holi'],
        ['source', 'type', 'id', 'x', 'y'],
        ['type', 'data', 'timestamp', 'id'],
        ['source', 'ranges'],
        ['start', 'startOffset', 'end', 'endOffset'],
        ['start', 'startOffset', 'endOffset'],
        ['source', 'type', 'id', 'x', 'y', 'pointerType'],
        ['source', 'positions'],
        ['x', 'y', 'id', 'timeOffset'],
      ];
    },
  });

  bench.add('msgpackr with schema', () => {
    packr.pack(mocks);
  });

  // const schemaPackEncoder = new Encoder();
  // bench.add('schemapack', () => {
  //   schemaPackEncoder.encode(mocks);
  // });

  await bench.run();

  // console.log(bench.results);

  console.log(bench.name);
  console.table(bench.table().sort((a, b) => b.Samples - a.Samples));
})();
