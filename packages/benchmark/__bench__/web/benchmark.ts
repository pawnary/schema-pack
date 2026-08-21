import { encode, Encoder as MessagePackEncoder } from '@msgpack/msgpack';
import { ExtensionCodec } from '@schema-pack/msgpack';
import { pack, Packr } from 'msgpackr';
import { Bench } from 'tinybench';

import mocks from '../../../../src/mocks.ts';

export default (async () => {
  // const mocks = [
  //   [39, 1024, 39, 1033],
  //   [39, 1024, 1033],
  // ];

  const bench = new Bench({
    name: 'Web benchmarks',
    time: 1000,
    throws: true,
  });

  bench.add('@msgpack/msgpack encode(mocks)', () => {
    encode(mocks);
  });

  const messagePackEncoder = new MessagePackEncoder();

  bench.add('@msgpack/msgpack encoder.encode(mocks)', () => {
    messagePackEncoder.encode(mocks);
  });

  const extensionCodec = new ExtensionCodec();

  bench.add('@msgpack/msgpack encode(mocks, { extensionCodec })', () => {
    encode(mocks, {
      extensionCodec,
    });
  });

  const messagePackEncoderWithExtensionCodec = new MessagePackEncoder({
    extensionCodec: new ExtensionCodec(),
  });

  bench.add(
    '@msgpack/msgpack encoder.encode(mocks) with extension codec',
    () => {
      messagePackEncoderWithExtensionCodec.encode(mocks);
    },
  );

  bench.add('msgpackr pack(mocks)', () => {
    pack(mocks);
  });

  const packr = new Packr({
    structures: [
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
    ],
  });

  bench.add('msgpackr packr.pack(mocks) (with structures)', () => {
    packr.pack(mocks);
  });

  await bench.run();

  console.log(bench.name);
  // @ts-ignore -- "Samples" always exists and is a number
  const table = bench.table().sort((a, b) => b.Samples - a.Samples);

  console.table(table);

  return table;
})();
