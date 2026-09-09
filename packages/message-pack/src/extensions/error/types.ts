import type { SerializerExtensionFactories } from '../serializer/types.ts';

export interface ErrorExtensionFactoryInput {
  message: string;
  options?: globalThis.ErrorOptions;
  errors?: globalThis.Error[];
  properties: Record<string, unknown>;
}

export interface ErrorExtensionOptions {
  /**
   * The type identifier used for the error extension.
   *
   * @default 1
   */
  type?: number;

  factories?: SerializerExtensionFactories<Error, ErrorExtensionFactoryInput>;
}
