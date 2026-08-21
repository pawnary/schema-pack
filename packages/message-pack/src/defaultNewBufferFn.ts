export default function defaultNewBufferFn<
  TBuffer extends Uint8Array = Uint8Array,
>(requiredSize: number): TBuffer {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return new Uint8Array(requiredSize) as TBuffer;
}
