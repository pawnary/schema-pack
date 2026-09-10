import type MessagePackDecoder from '../../decoder/interfaces/messagePackDecoder.ts';
import type MessagePackEncoder from '../../encoder/interfaces/messagePackEncoder.ts';
import type MessagePackBuiltInExtension from '../interfaces/messagePackBuiltInExtension.ts';
import SerializerExtension from '../serializer/serializer.ts';
import defaultFactories from './defaultFactories.ts';
import errorExtensionSymbols from './symbols.ts';
import type {
  ErrorExtensionFactory,
  ErrorExtensionFactoryInput,
  ErrorExtensionOptions,
} from './types.ts';

const excludedKeys = new Set(['stack', 'message', 'name', 'cause']);

class ErrorExtension<TBuffer extends Uint8Array = Uint8Array>
  extends SerializerExtension<
    Error,
    ErrorExtensionFactoryInput,
    ErrorExtensionFactory,
    TBuffer
  >
  implements MessagePackBuiltInExtension<Error, TBuffer>
{
  /**
   * The default type value for the error extension. This is used when no
   * specific type is provided during instantiation.
   */
  static readonly DEFAULT_TYPE = 1;

  type: number;

  constructor(options?: ErrorExtensionOptions) {
    super(defaultFactories());

    this.type = options?.type ?? ErrorExtension.DEFAULT_TYPE;

    if (options?.factories) {
      for (const [constructor, factory] of options.factories) {
        this.registerFactory(constructor, factory);
      }
    }
  }

  /**
   * Encodes an Error value into the provided buffer. The method is responsible
   * for serializing the Error object according to the Message Pack extension
   * format.
   *
   * @param value - The Error value to encode.
   * @param encoder - The extension encoder to write the encoded data to.
   */
  encodeInto(value: Error, encoder: MessagePackEncoder<TBuffer>): void {
    const stack = value.stack;
    const message = value.message;
    const cause = value.cause;
    const constructorName = value.constructor.name;
    let name: string | undefined;

    if (Object.hasOwn(value, 'name')) {
      name = value.name;
    }

    const extensionEncoder = encoder.getExtensionEncoder().resetBuffer();

    if (stack !== undefined) {
      const capacity = 1 + stack.length * 4;
      extensionEncoder.ensureCapacity(capacity);
      extensionEncoder.buffer[extensionEncoder.offset++] =
        errorExtensionSymbols.STACK;
      extensionEncoder.writeString(stack);
    }

    if (message.length > 0) {
      const capacity = 1 + message.length * 4;

      extensionEncoder.ensureCapacity(capacity);
      extensionEncoder.buffer[extensionEncoder.offset++] =
        errorExtensionSymbols.MESSAGE;
      extensionEncoder.writeString(message);
    }

    if (name !== undefined) {
      const capacity = 1 + name.length * 4;

      extensionEncoder.ensureCapacity(capacity);
      extensionEncoder.buffer[extensionEncoder.offset++] =
        errorExtensionSymbols.NAME;
      extensionEncoder.writeString(name);
    }

    if (cause !== undefined) {
      extensionEncoder.ensureCapacity(1);
      extensionEncoder.buffer[extensionEncoder.offset++] =
        errorExtensionSymbols.CAUSE;
      extensionEncoder.write(cause);
    }

    if (Object.hasOwn(value, 'errors') && value instanceof AggregateError) {
      extensionEncoder.ensureCapacity(1);
      extensionEncoder.buffer[extensionEncoder.offset++] =
        errorExtensionSymbols.ERRORS;
      extensionEncoder.writeArray(value.errors);
    }

    const keys = Object.keys(value).filter((key) => !excludedKeys.has(key));

    if (keys.length > 0) {
      extensionEncoder.ensureCapacity(1);
      extensionEncoder.buffer[extensionEncoder.offset++] =
        errorExtensionSymbols.PROPERTIES;
      extensionEncoder.openMap(keys.length);

      for (const key of keys) {
        extensionEncoder.writeString(key);
        // @ts-expect-error - We are iterating over the keys of the object, so we can safely access the value using the key.
        extensionEncoder.write(value[key]);
      }
    }

    extensionEncoder.ensureCapacity(1 + constructorName.length * 4);
    extensionEncoder.buffer[extensionEncoder.offset++] =
      errorExtensionSymbols.CONSTRUCTOR_NAME;
    extensionEncoder.writeString(constructorName);

    encoder.writeExtension(this, extensionEncoder);
  }

  /**
   * Decodes an Error value from the provided DataView. It reads the encoded
   * data and reconstructs the Error object according to the Message Pack
   * extension format. The method returns the decoded Error value.
   */
  decode(decoder: MessagePackDecoder<TBuffer>, size: number): Error {
    let stack: string | undefined;
    let message = '';
    let name: string | undefined;
    let cause: unknown;
    let constructorName: string | undefined;
    let errors: Error[] = [];
    let properties: Record<string, unknown> = {};

    const limit = size + decoder.offset;

    while (decoder.offset < limit) {
      const errorExtensionSymbol = decoder.buffer[decoder.offset++];

      switch (errorExtensionSymbol) {
        case errorExtensionSymbols.STACK: {
          stack = decoder.nextValue<string>();

          break;
        }
        case errorExtensionSymbols.MESSAGE: {
          message = decoder.nextValue<string>();

          break;
        }
        case errorExtensionSymbols.NAME: {
          name = decoder.nextValue<string>();

          break;
        }
        case errorExtensionSymbols.CAUSE: {
          cause = decoder.nextValue();

          break;
        }
        case errorExtensionSymbols.CONSTRUCTOR_NAME: {
          constructorName = decoder.nextValue<string>();

          break;
        }
        case errorExtensionSymbols.ERRORS: {
          errors = decoder.nextValue<Error[]>();

          break;
        }
        case errorExtensionSymbols.PROPERTIES: {
          properties = decoder.nextValue<Record<string, unknown>>();

          break;
        }
        default: {
          throw new Error(
            `unknown error extension symbol: ${errorExtensionSymbol} at offset ${decoder.offset - 1}`,
          );
        }
      }
    }

    if (constructorName === undefined) {
      throw new Error('Failed to get constructor name from error extension');
    }

    let options: ErrorOptions | undefined;

    if (cause !== undefined) {
      options = {
        cause,
      };
    }

    const input: ErrorExtensionFactoryInput = {
      errors,
      message,
      options,
      properties,
    };

    const factory = this.fetchFactoryByConstructorName(constructorName);

    const error = factory(input);

    if (stack !== undefined) {
      error.stack = stack;
    }

    if (name !== undefined) {
      error.name = name;
    }

    return error;
  }
}

export default ErrorExtension;
