import { Decoder, Encoder } from '@schema-pack/message-pack';

const encoder = new Encoder({
  extensions: {
    error: false,
  },
});

const error = new TypeError('invalid input');

// if uses writeError instead of write, it will throw an error because the
// extension is disabled, so we use write instead, which will encode it as a
// regular object
const encoded = encoder.write(error).flush();

const decoder = Decoder.fromEncoder(encoder);

const decoded = decoder.decode(encoded);

console.log({ decoded });

// as you can see, the decoded value is an empty regular object, not an Error
// instance, this is because MessagePack does not support serializing Error
// instances by default, and the error extension was disabled in the encoder
// configuration
