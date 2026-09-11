// oxlint-disable complexity
import ErrorExtension from './extensions/error/error.ts';
import type MessagePackBuiltInExtension from './extensions/interfaces/messagePackBuiltInExtension.ts';
import type MessagePackExtension from './extensions/interfaces/messagePackExtension.ts';
import TimestampDateExtension from './extensions/timestampDate/timestampDate.ts';
import type MessagePackBufferWithExtensions from './interfaces/messagePackBufferWithExtensions.ts';
import type {
  BigIntExtensionOptions,
  BufferWithExtensionsOptions,
} from './types.ts';
import assertValidExtensionType from './utils/assertValidExtensionType.ts';

type MessagePackExtensionLike<TBuffer extends Uint8Array> =
  | MessagePackExtension<object, TBuffer>
  | MessagePackBuiltInExtension<object, TBuffer>;

abstract class BufferWithExtensions<
  TBuffer extends Uint8Array = Uint8Array,
> implements MessagePackBufferWithExtensions<TBuffer> {
  /**
   * Default extension type for `BigInt` values. This is used when the user does
   * not provide a custom extension type for `BigInt` values.
   */
  static readonly DEFAULT_BIG_INT_EXTENSION_TYPE = 0;

  /**
   * The extensions map is used to store the registered extensions. The key is
   * the extension type, and the value is the extension instance.
   */
  protected extensions = new Map<
    number,
    MessagePackExtension<object, TBuffer>
  >();

  /**
   * The built-in extensions map is used to store the built-in extensions. The
   * key is the extension type, and the value is the extension instance.
   */
  protected builtInExtensions = new Map<
    number,
    MessagePackBuiltInExtension<object, TBuffer>
  >();

  /**
   * The timestamp date extension is used to encode and decode `Date` values. It
   * is optional and can be disabled by setting the `extensions.timestampDate`
   * option to `false`.
   */
  readonly timestampDateExtension?: TimestampDateExtension<TBuffer> = undefined;

  /**
   * The big integer extension is used to encode and decode `BigInt` values. It
   * is optional and can be disabled by setting the `extensions.bigInt` option
   * to `false`.
   *
   * If enabled, the user can provide a custom extension type for `BigInt`
   * values by setting the `extensions.bigInt.type` option.
   */
  readonly bigIntExtension?: BigIntExtensionOptions = undefined;

  /**
   * The error extension is used to encode and decode `Error` values. It is
   * optional and can be disabled by setting the `extensions.error` option to
   * `false`.
   *
   * If enabled, the user can provide a custom extension for `Error` values by
   * setting the `extensions.error` option to an instance of `ErrorExtension`.
   */
  readonly errorExtension?: ErrorExtension<TBuffer> = undefined;

  constructor(options?: BufferWithExtensionsOptions<TBuffer>) {
    if (options?.extensions !== false) {
      if (options?.extensions?.bigInt !== false) {
        this.bigIntExtension = options?.extensions?.bigInt ?? {
          type: BufferWithExtensions.DEFAULT_BIG_INT_EXTENSION_TYPE,
        };

        assertValidExtensionType(this.bigIntExtension.type);
      }

      if (options?.extensions?.error !== false) {
        if (options?.extensions?.error instanceof ErrorExtension) {
          this.errorExtension = options.extensions.error;
        } else {
          this.errorExtension = new ErrorExtension(options?.extensions?.error);
        }

        assertValidExtensionType(this.errorExtension.type);

        this.builtInExtensions.set(
          this.errorExtension.type,
          this.errorExtension,
        );
      }

      if (options?.extensions?.timestampDate !== false) {
        if (
          options?.extensions?.timestampDate instanceof TimestampDateExtension
        ) {
          this.timestampDateExtension = options.extensions.timestampDate;
        } else {
          this.timestampDateExtension = new TimestampDateExtension();
        }

        this.builtInExtensions.set(
          TimestampDateExtension.DEFAULT_TYPE,
          this.timestampDateExtension,
        );
      }
    }
  }

  getExtensions(): ReadonlyMap<number, MessagePackExtension<object, TBuffer>> {
    return this.extensions;
  }

  addExtension<TValue extends object>(
    extension: MessagePackExtension<TValue, TBuffer>,
  ): this {
    if (this.extensions.has(extension.type)) {
      // oxlint-disable-next-line typescript/no-non-null-assertion - Already checked that the extension exists
      const existent = this.extensions.get(extension.type)!;

      throw new Error(
        `Extension with type ${extension.type} already registered for ${existent.constructor.name}`,
      );
    }

    assertValidExtensionType(extension.type);

    if (this.builtInExtensions.has(extension.type)) {
      // oxlint-disable-next-line typescript/no-non-null-assertion - Already checked that the extension exists
      const existent = this.builtInExtensions.get(extension.type)!;

      throw new Error(
        `Extension with type ${extension.type} conflicts with built-in extension ${existent.constructor.name}`,
      );
    }

    if (extension.type === this.bigIntExtension?.type) {
      throw new Error(
        `Extension with type ${extension.type} conflicts with built-in BigInt extension`,
      );
    }

    this.extensions.set(extension.type, extension);

    return this;
  }

  fetchExtension(type: number): MessagePackExtensionLike<TBuffer> {
    let extension: MessagePackExtensionLike<TBuffer> | undefined =
      this.builtInExtensions.get(type);

    if (!extension) {
      extension = this.extensions.get(type);

      if (!extension) {
        throw new Error(`Extension with type ${type} not found`);
      }
    }

    return extension;
  }
}

export default BufferWithExtensions;
