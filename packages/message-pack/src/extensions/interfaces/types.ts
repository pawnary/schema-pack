export type Constructor<TValue> = abstract new (
  // oxlint-disable-next-line typescript/no-explicit-any
  ...args: any[]
) => TValue;

// export type ConstructorExtensionFactory<TValue extends object, TInput> = (
//   input: TInput,
// ) => InstanceType<Constructor<TValue>>;
