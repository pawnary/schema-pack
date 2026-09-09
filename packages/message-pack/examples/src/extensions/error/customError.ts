import assert from 'node:assert';

import { Decoder, Encoder } from '@schema-pack/message-pack';

class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);

    this.statusCode = statusCode;
  }
}

const encoder = new Encoder({
  extensions: {
    error: {
      factories: [
        [
          HttpError,
          (input) =>
            new HttpError(Number(input.properties.statusCode), input.message),
        ],
      ],
    },
  },
});

const decoder = Decoder.fromEncoder(encoder);

const error = new HttpError(404, 'not found');

const buffer = encoder.writeError(error).flush();

const decoded = decoder.decode(buffer);

console.log({ decoded, error });

assert.deepStrictEqual(decoded, error);
