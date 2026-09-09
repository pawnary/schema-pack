import type { SerializerExtensionFactories } from '../serializer/types.ts';
import type { ErrorExtensionFactoryInput } from './types.ts';

export default function defaultFactories(): SerializerExtensionFactories<
  globalThis.Error,
  ErrorExtensionFactoryInput
> {
  return [
    [Error, (input): Error => new Error(input.message, input.options)],
    [
      AggregateError,
      (input): AggregateError =>
        new AggregateError(input.errors ?? [], input.message, input.options),
    ],
    [
      EvalError,
      (input): EvalError => new EvalError(input.message, input.options),
    ],
    [
      RangeError,
      (input): RangeError => new RangeError(input.message, input.options),
    ],
    [
      ReferenceError,
      (input): ReferenceError =>
        new ReferenceError(input.message, input.options),
    ],
    [
      SyntaxError,
      (input): SyntaxError => new SyntaxError(input.message, input.options),
    ],
    [
      TypeError,
      (input): TypeError => new TypeError(input.message, input.options),
    ],
    [URIError, (input): URIError => new URIError(input.message, input.options)],
  ];
}
