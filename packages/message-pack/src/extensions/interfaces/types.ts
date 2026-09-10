export type Constructor<TValue> = abstract new (
  // oxlint-disable-next-line typescript/no-explicit-any
  ...args: any[]
) => TValue;
