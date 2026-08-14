import { Packr } from 'msgpackr';
import Encoder from '../../src/encoder/encoder.ts';
import BigIntExtension from '../../src/extensions/bigint/bigInt.ts';
import {
  decode,
  encode,
  Encoder as MessagepackEncoder,
  ExtensionCodec,
  DecodeError,
} from '@msgpack/msgpack';
import { SerializerBenchSuite } from '@schema-pack/benchmark';
import { UINT64_MAX, INT64_MIN } from '../../src/constants.ts';

// -- msgpackr --
const sharedMsgpackrPackr = new Packr({
  useBigIntExtension: true,
});

// -- @msgpack/msgpack --
// https://github.com/msgpack/msgpack-javascript/tree/main#handling-bigint-with-extensioncodec
const BIGINT_EXT_TYPE = 0; // Any in 0-127
const extensionCodec = new ExtensionCodec();
extensionCodec.register({
  type: BIGINT_EXT_TYPE,
  encode(input: unknown): Uint8Array | null {
    if (typeof input === 'bigint') {
      if (
        input <= Number.MAX_SAFE_INTEGER &&
        input >= Number.MIN_SAFE_INTEGER
      ) {
        return encode(Number(input));
      } else {
        return encode(String(input));
      }
    } else {
      return null;
    }
  },
  decode(data: Uint8Array): bigint {
    const val = decode(data);
    if (!(typeof val === 'string' || typeof val === 'number')) {
      throw new DecodeError(`unexpected BigInt source: ${val} (${typeof val})`);
    }
    return BigInt(val);
  },
});

const sharedMsgpackEncoder = new MessagepackEncoder({
  extensionCodec,
});

// -- @schema-pack/message-pack --
const sharedSchemaPackEncoderDefault = new Encoder();
sharedSchemaPackEncoderDefault.addExtension(new BigIntExtension());

const dataTypesFactory = {
  'bigint u64 (max)': () => UINT64_MAX,
  'bigint 64 (min)': () => INT64_MIN,
  'bigint u65 (max)': () => (1n << 65n) - 1n,
  'bigint 65 (min)': () => -((1n << 64n) - 1n),
  'bigint u128 (max)': () => (1n << 128n) - 1n,
  'bigint 128 (min)': () => -((1n << 127n) - 1n),
  'bigint u256 (max)': () => (1n << 256n) - 1n,
  'bigint 256 (min)': () => -((1n << 255n) - 1n),
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
