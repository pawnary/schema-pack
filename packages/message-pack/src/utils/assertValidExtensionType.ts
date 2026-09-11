export default function assertValidExtensionType(type: number): void {
  if (!Number.isInteger(type)) {
    throw new TypeError(`Extension type must be an integer, got ${type}`);
  }

  if (type < -128 || type > 127) {
    throw new Error(
      `Extension type must be in the range -128 to 127, got ${type}`,
    );
  }
}
