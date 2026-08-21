import {
  decode,
  DecodeError,
  encode,
  ExtensionCodec,
  Encoder as MessagepackEncoder,
} from '@msgpack/msgpack';
import { SerializerBenchSuite } from '@schema-pack/benchmark';
import { Packr } from 'msgpackr';

import Encoder from '../../src/encoder/encoder.ts';
import BigIntExtension from '../../src/extensions/bigint/bigInt.ts';

// -- msgpackr --
const sharedMsgpackrPackr = new Packr({
  useBigIntExtension: true,
});

// -- @msgpack/msgpack --
// https://github.com/msgpack/msgpack-javascript/tree/main#handling-bigint-with-extensioncodec
const BIGINT_EXT_TYPE = 0; // Any in 0-127
const extensionCodec = new ExtensionCodec();
extensionCodec.register({
  decode(data: Uint8Array): bigint {
    const val = decode(data);
    if (!(typeof val === 'string' || typeof val === 'number')) {
      throw new DecodeError(`unexpected BigInt source: ${val} (${typeof val})`);
    }
    return BigInt(val);
  },
  encode(input: unknown): Uint8Array | null {
    if (typeof input === 'bigint') {
      if (
        input <= Number.MAX_SAFE_INTEGER &&
        input >= Number.MIN_SAFE_INTEGER
      ) {
        return encode(Number(input));
      }
      return encode(String(input));
    }
    return null;
  },
  type: BIGINT_EXT_TYPE,
});

const sharedMsgpackEncoder = new MessagepackEncoder({
  extensionCodec,
});

// -- @schema-pack/message-pack --
const sharedSchemaPackEncoderDefault = new Encoder();

sharedSchemaPackEncoderDefault.addExtension(new BigIntExtension());

const dataTypesFactory = {
  'bigint 128 (min)': (): bigint => -((1n << 127n) - 1n),
  'bigint 256 (min)': (): bigint => -((1n << 255n) - 1n),
  'bigint 64 (min)': (): bigint => -((1n << 63n) - 1n),
  'bigint 65 (min)': (): bigint => -((1n << 64n) - 1n),
  'bigint u128 (max)': (): bigint => (1n << 128n) - 1n,
  'bigint u256 (max)': (): bigint => (1n << 256n) - 1n,
  'bigint u64 (max)': (): bigint => (1n << 64n) - 1n,
  'bigint u65 (max)': (): bigint => (1n << 65n) - 1n,
};

const suite = new SerializerBenchSuite(dataTypesFactory);

suite
  .add('msgpackr shared Packr.pack', (value) => sharedMsgpackrPackr.pack(value))
  .add('@msgpack/msgpack shared encoder', (value) =>
    sharedMsgpackEncoder.encode(value),
  )
  .add('@msgpack/msgpack encode', (value) => encode(value, { extensionCodec }))
  .add('@schema-pack/message-pack shared Encoder.encode', (value) =>
    sharedSchemaPackEncoderDefault.encode(value),
  )
  .run();
