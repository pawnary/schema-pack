// oxlint-disable typescript/consistent-type-imports
import {
  dataTypesFactory,
  SerializersBenchSuite,
} from '@schema-pack/benchmark';

const suite = new SerializersBenchSuite({
  dataTypesFactory,
});

suite
  .add({
    name: 'msgpackr shared encoder/decoder',
    setup: async () => {
      const { Packr, Unpackr } = await import('msgpackr');
      type Options = import('msgpackr').Options;

      // keep same conditions for other decoders
      const options: Options = {
        encodeUndefinedAsNil: true,
        mapsAsObjects: true,
        useBigIntExtension: true,
        useRecords: false,
        variableMapSize: true, // avoid failing in map32,
      };

      const packr = new Packr(options);
      const unpackr = new Unpackr(options);

      return {
        decodeFn: (value): unknown => unpackr.unpack(value),
        encodeFn: (value): Buffer => packr.pack(value),
      };
    },
  })
  .add({
    name: '@msgpack/msgpack shared encoder/decoder',
    setup: async () => {
      const { Encoder, Decoder } = await import('@msgpack/msgpack');

      const options = {
        useBigInt64: true,
      };

      const encoder = new Encoder({
        ...options,
      });

      const decoder = new Decoder({
        ...options,
      });

      return {
        decodeFn: (value): unknown => decoder.decode(value),
        encodeFn: (value): Uint8Array => encoder.encode(value),
      };
    },
  })
  .add({
    name: '@jsonjoy.com/json-pack shared encoder/decoder',
    setup: async () => {
      type PackValue = import('@jsonjoy.com/json-pack/lib/types.js').PackValue;
      const { MessagePackEncoder, MessagePackDecoder } =
        await import('@jsonjoy.com/json-pack/lib/msgpack/index.js');

      const encoder = new MessagePackEncoder();
      const decoder = new MessagePackDecoder();

      return {
        decodeFn: (value): PackValue => decoder.read(value),
        encodeFn: (value): Uint8Array => encoder.encode(value),
      };
    },
  })
  .add({
    name: '@schema-pack/message-pack shared encoder/decoder',
    setup: async () => {
      const { Encoder, Decoder } = await import('../src/index.ts');

      const encoder = new Encoder();
      const decoder = new Decoder();

      return {
        decodeFn: (value): unknown => decoder.decode(value),
        encodeFn: (value): Uint8Array => encoder.write(value).flush(),
      };
    },
  });

await suite.run();
