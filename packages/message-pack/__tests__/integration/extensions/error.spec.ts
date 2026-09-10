// oxlint-disable max-classes-per-file
import { describe, expect, it, test } from 'vitest';

import Decoder from '../../../src/decoder/decoder.ts';
import Encoder from '../../../src/encoder/encoder.ts';
import ErrorExtension from '../../../src/extensions/error/error.ts';

describe('`Error`', () => {
  it('should write a default Error', () => {
    const encoder = new Encoder({
      initialBufferSize: 1,
    });
    const decoder = new Decoder();

    const error = new Error('oops!');

    const encoded = encoder.writeObject(error).flush();

    const decoded = decoder.decode<Error>(encoded);

    expect(decoded).toStrictEqual(error);
    expect(decoded.message).toBe(error.message);
    expect(decoded.name).toBe(error.name);
    expect(decoded.stack).toBe(error.stack);
    expect(decoded.cause).toStrictEqual(error.cause);
  });

  it('should write an Error with implicit name', () => {
    const encoder = new Encoder({
      initialBufferSize: 1,
    });
    const decoder = new Decoder();

    const error = new Error('oops!');
    error.name = 'NewErrorName';

    const encoded = encoder.writeObject(error).flush();

    const decoded = decoder.decode<Error>(encoded);

    expect(decoded).toStrictEqual(error);
    expect(decoded.message).toBe(error.message);
    expect(decoded.name).toBe(error.name);
    expect(decoded.stack).toBe(error.stack);
    expect(decoded.cause).toStrictEqual(error.cause);
  });

  it('should write an Error with deep causes', () => {
    const encoder = new Encoder({
      initialBufferSize: 1,
    });
    const decoder = new Decoder();

    const error = new Error('oops!', {
      cause: new Error('oops! cause', {
        cause: new Error('root cause'),
      }),
    });

    const encoded = encoder.writeObject(error).flush();

    const decoded = decoder.decode<Error>(encoded);

    expect(decoded).toStrictEqual(error);
    expect(decoded.message).toBe(error.message);
    expect(decoded.name).toBe(error.name);
    expect(decoded.stack).toBe(error.stack);
    expect(decoded.cause).toStrictEqual(error.cause);
  });
});

describe('`AggregateError`', () => {
  it('should write an AggregateError without a cause', () => {
    const encoder = new Encoder({
      initialBufferSize: 1,
    });
    const decoder = new Decoder();

    const error = new AggregateError(
      [new Error('first error'), new Error('second error')],
      'oops!',
    );

    const encoded = encoder.writeObject(error).flush();

    const decoded = decoder.decode<AggregateError>(encoded);

    expect(decoded).toStrictEqual(error);
    expect(decoded.message).toBe(error.message);
    expect(decoded.name).toBe(error.name);
    expect(decoded.stack).toBe(error.stack);
    expect(decoded.cause).toStrictEqual(error.cause);
    expect(decoded.errors).toStrictEqual(error.errors);
  });

  it('should write an AggregateError with cause', () => {
    const encoder = new Encoder({
      initialBufferSize: 1,
    });
    const decoder = new Decoder();

    const error = new AggregateError(
      [new Error('first error'), new Error('second error')],
      'oops!',
      {
        cause: new Error('root cause'),
      },
    );

    const encoded = encoder.writeObject(error).flush();

    const decoded = decoder.decode<AggregateError>(encoded);

    expect(decoded).toStrictEqual(error);
    expect(decoded.message).toBe(error.message);
    expect(decoded.name).toBe(error.name);
    expect(decoded.stack).toBe(error.stack);
    expect(decoded.cause).toStrictEqual(error.cause);
    expect(decoded.errors).toStrictEqual(error.errors);
  });
});

test('`EvalError`', () => {
  const encoder = new Encoder({
    initialBufferSize: 1,
  });
  const decoder = new Decoder();

  const error = new EvalError('oops!');

  const encoded = encoder.writeObject(error).flush();

  const decoded = decoder.decode<EvalError>(encoded);

  expect(decoded).toStrictEqual(error);
  expect(decoded.message).toBe(error.message);
  expect(decoded.name).toBe(error.name);
  expect(decoded.stack).toBe(error.stack);
  expect(decoded.cause).toStrictEqual(error.cause);
});

test('`RangeError`', () => {
  const encoder = new Encoder({
    initialBufferSize: 1,
  });
  const decoder = new Decoder();

  const error = new RangeError('oops!');

  const encoded = encoder.writeObject(error).flush();

  const decoded = decoder.decode<RangeError>(encoded);

  expect(decoded).toStrictEqual(error);
  expect(decoded.message).toBe(error.message);
  expect(decoded.name).toBe(error.name);
  expect(decoded.stack).toBe(error.stack);
  expect(decoded.cause).toStrictEqual(error.cause);
});

test('`ReferenceError`', () => {
  const encoder = new Encoder({
    initialBufferSize: 1,
  });
  const decoder = new Decoder();

  const error = new ReferenceError('oops!');

  const encoded = encoder.writeObject(error).flush();

  const decoded = decoder.decode<ReferenceError>(encoded);

  expect(decoded).toStrictEqual(error);
  expect(decoded.message).toBe(error.message);
  expect(decoded.name).toBe(error.name);
  expect(decoded.stack).toBe(error.stack);
  expect(decoded.cause).toStrictEqual(error.cause);
});

test('`SyntaxError`', () => {
  const encoder = new Encoder({
    initialBufferSize: 1,
  });
  const decoder = new Decoder();

  const error = new SyntaxError('oops!');

  const encoded = encoder.writeObject(error).flush();

  const decoded = decoder.decode<SyntaxError>(encoded);

  expect(decoded).toStrictEqual(error);
  expect(decoded.message).toBe(error.message);
  expect(decoded.name).toBe(error.name);
  expect(decoded.stack).toBe(error.stack);
  expect(decoded.cause).toStrictEqual(error.cause);
});

test('`TypeError`', () => {
  const encoder = new Encoder({
    initialBufferSize: 1,
  });
  const decoder = new Decoder();

  const error = new TypeError('oops!');

  const encoded = encoder.writeObject(error).flush();

  const decoded = decoder.decode<TypeError>(encoded);

  expect(decoded).toStrictEqual(error);
  expect(decoded.message).toBe(error.message);
  expect(decoded.name).toBe(error.name);
  expect(decoded.stack).toBe(error.stack);
  expect(decoded.cause).toStrictEqual(error.cause);
});

test('`URIError`', () => {
  const encoder = new Encoder({
    initialBufferSize: 1,
  });
  const decoder = new Decoder();

  const error = new URIError('oops!');

  const encoded = encoder.writeObject(error).flush();

  const decoded = decoder.decode<URIError>(encoded);

  expect(decoded).toStrictEqual(error);
  expect(decoded.message).toBe(error.message);
  expect(decoded.name).toBe(error.name);
  expect(decoded.stack).toBe(error.stack);
  expect(decoded.cause).toStrictEqual(error.cause);
});

describe('register custom errors', () => {
  class MyCustomError extends Error {
    // Disable custom error definition to test the default behavior of custom
    // error without explicitly setting the name.
    //
    // oxlint-disable-next-line unicorn/custom-error-definition
    constructor(message = 'oops!') {
      super(message);
    }
  }

  it('using the encoder/decoder constructor options', () => {
    const encoder = new Encoder({
      extensions: {
        error: {
          factories: [
            [
              MyCustomError,
              (input): MyCustomError => new MyCustomError(input.message),
            ],
          ],
        },
      },
      initialBufferSize: 1,
    });

    const decoder = Decoder.fromEncoder(encoder);

    const error = new MyCustomError();

    const encoded = encoder.writeObject(error).flush();

    const decoded = decoder.decode<MyCustomError>(encoded);

    expect(decoded).toStrictEqual(error);
    expect(decoded.message).toBe(error.message);
    expect(decoded.name).toBe(error.name);
    expect(decoded.stack).toBe(error.stack);
    expect(decoded.cause).toStrictEqual(error.cause);
  });

  it('using error extension constructor options', () => {
    const errorExtension = new ErrorExtension({
      factories: [
        [
          MyCustomError,
          (input): MyCustomError => new MyCustomError(input.message),
        ],
      ],
    });

    const encoder = new Encoder({
      extensions: {
        error: errorExtension,
      },
      initialBufferSize: 1,
    });

    const decoder = Decoder.fromEncoder(encoder);

    const error = new MyCustomError();

    const encoded = encoder.writeObject(error).flush();

    const decoded = decoder.decode<MyCustomError>(encoded);

    expect(decoded).toStrictEqual(error);
    expect(decoded.message).toBe(error.message);
    expect(decoded.name).toBe(error.name);
    expect(decoded.stack).toBe(error.stack);
    expect(decoded.cause).toStrictEqual(error.cause);
  });

  it('add custom properties to error', () => {
    // TODO: update this test to use type safe access for custom properties
    class WithPropertiesError extends Error {
      myCustomProperty: string;

      // oxlint-disable-next-line unicorn/custom-error-definition
      constructor(message: string, customProperty: string) {
        super(message);

        this.myCustomProperty = customProperty;
      }
    }

    const encoder = new Encoder({
      extensions: {
        error: {
          factories: [
            [
              WithPropertiesError,
              (input): WithPropertiesError =>
                new WithPropertiesError(
                  input.message,
                  String(input.properties.myCustomProperty),
                ),
            ],
          ],
        },
      },
    });

    const decoder = Decoder.fromEncoder(encoder);

    const error = new WithPropertiesError('message', 'customProperty');

    const encoded = encoder.writeObject(error).flush();

    const decoded = decoder.decode<WithPropertiesError>(encoded);

    expect(decoded).toStrictEqual(error);
    expect(decoded.message).toBe(error.message);
    expect(decoded.name).toBe(error.name);
    expect(decoded.stack).toBe(error.stack);
    expect(decoded.cause).toStrictEqual(error.cause);
  });
});
