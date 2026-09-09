import { Encoder } from '@schema-pack/message-pack';

const encoder = new Encoder({
  extensions: {
    bigInt: false,
  },
});

encoder.writeBigInt(1n);
