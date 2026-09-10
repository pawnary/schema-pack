import type {
  SerializerExtensionFactories,
  SerializerExtensionFactory,
} from '../serializer/types.ts';

type ErrorExtensionFactories = SerializerExtensionFactories<
  Error,
  ErrorExtensionFactoryInput,
  ErrorExtensionFactory
>;

export interface ErrorExtensionFactoryInput {
  message: string;
  options?: globalThis.ErrorOptions;
  errors?: globalThis.Error[];
  properties: Record<string, unknown>;
}

export type ErrorExtensionFactory = SerializerExtensionFactory<
  Error,
  ErrorExtensionFactoryInput
>;

export interface ErrorExtensionOptions {
  /**
   * The type identifier used for the error extension.
   *
   * @default 1
   */
  type?: number;

  factories?: ErrorExtensionFactories;
}
