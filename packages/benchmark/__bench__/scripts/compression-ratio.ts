import { inspect } from 'node:util';
import { gzipSync } from 'node:zlib';

import {
  Decoder,
  Encoder as MessagePackEncoder,
  decode,
  encode,
} from '@msgpack/msgpack';
import { Encoder } from '@schema-pack/msgpack';
import { ExtensionCodec, SchemaPackEncoder } from '@schema-pack/msgpack';
import { SchemaBuilder } from '@schema-pack/schema';
import { pack, Packr, unpack } from 'msgpackr';

import mocks from '../../../../src/mocks.ts';

(() => {
  console.log('Starting PoC with SchemaPack + MessagePack...');
  console.log('Starting PoC...');
  const mocks = [
    [39, 1024, 39, 1033],
    [39, 1024, 1033],
  ];

  const mocksSize = new Blob([JSON.stringify(mocks)]).size;
  const mockSizeGziped = gzipSync(JSON.stringify(mocks)).byteLength;

  function debugCompressionRatio(
    label: string,
    newValue: Buffer<ArrayBufferLike> | Uint8Array<ArrayBufferLike>,
  ) {
    let newSize: number;

    if (newValue instanceof Buffer || newValue instanceof Uint8Array) {
      newSize = newValue.byteLength;
    } else {
      newSize = new Blob([JSON.stringify(newValue)]).size;
    }

    const newValueGziped = gzipSync(newValue);

    console.log(`--- ${label} ---`);
    console.log(`Original size: ${mocksSize} bytes`);
    console.log(`Original Gzip size: ${mockSizeGziped} bytes`);
    console.log(`New size: ${newSize} bytes`);
    console.log(`New Gzip size: ${newValueGziped.byteLength} bytes`);
    console.log(`Space saved: ${(1 - newSize / mocksSize) * 100}%`);
    console.log(
      `Space saved when gziped: ${(1 - newValueGziped.byteLength / mockSizeGziped) * 100}%`,
    );
  }

  console.log('JSON mocks:', JSON.stringify(mocks));
  console.log('--- Meta ---');
  console.log(`Original size: ${mocksSize} bytes`);
  console.log(`Original Gzip size: ${mockSizeGziped} bytes`);

  // const schema = new SchemaBuilder({
  //   data: mocks
  // }).getSchema();

  // const encoder = new Encoder(mocks, schema);
  // const schemaPackEncodedMocks = encoder.encodeToArray();
  // const encodedArraySize = new Blob([JSON.stringify(schemaPackEncodedMocks)]).size;

  // debugCompressionRatio('raw SchemaPack', encodedArraySize);
  // console.log('SchemaPack encoded mocks', JSON.stringify([...schemaPackEncodedMocks]));

  const rawMsgpackrEncodedMocks = pack(mocks);
  debugCompressionRatio('raw msgpackr', rawMsgpackrEncodedMocks);

  let packr = new Packr({
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
    saveStructures(_structures) {
      // // writeFileSync('my-shared-structures.mp', pack(structures));
      // console.log(JSON.stringify(structures, null, 2));
      // process.exit(1);
    },
  });

  const msgpackrEncodedMocks = packr.pack(mocks);
  debugCompressionRatio('msgpackr + schema', msgpackrEncodedMocks);

  console.log(
    'msgpackr + schema mocks:',
    JSON.stringify([...msgpackrEncodedMocks]),
  );

  // const test = unpack(msgpackrEncodedMocks);
  // console.log("msgpackr + schema unpacked mocks:", JSON.stringify(test));

  const messagePackEncodedMocks = encode(mocks);
  debugCompressionRatio('raw MessagePack', messagePackEncodedMocks);

  console.log(
    'raw MessagePack mocks:',
    JSON.stringify([...messagePackEncodedMocks]),
  );
  // console.log("raw MessagePack mocks:", new Uint8Array(messagePackEncodedMocks));

  // const schemaPackMessagePackEncodedMocks = encode(schemaPackEncodedMocks);
  // debugCompressionRatio('SchemaPack + MessagePack', schemaPackMessagePackEncodedMocks);

  // const schemaPackMsgpackrEncodedMocks = pack(schemaPackEncodedMocks);
  // debugCompressionRatio('SchemaPack + msgpackr', schemaPackMsgpackrEncodedMocks);

  const extensionCodec = new ExtensionCodec();

  const messagePackCustomExtensionCodecEncodedMocks = encode(mocks, {
    extensionCodec,
  });

  debugCompressionRatio(
    'MessagePack + custom ExtensionCodec',
    messagePackCustomExtensionCodecEncodedMocks,
  );

  console.log(
    'MessagePack + custom ExtensionCodec mocks:',
    JSON.stringify([...messagePackCustomExtensionCodecEncodedMocks]),
  );
  // console.log("MessagePack + custom ExtensionCodec mocks:", new Uint8Array(messagePackCustomExtensionCodecEncodedMocks));

  const schemaPackEncoder = new Encoder();
  const schemaPackEncodedMocks = schemaPackEncoder.encode(mocks);

  debugCompressionRatio('schemapack', schemaPackEncodedMocks);
  console.log('schemapack mocks:', JSON.stringify([...schemaPackEncodedMocks]));
})();
