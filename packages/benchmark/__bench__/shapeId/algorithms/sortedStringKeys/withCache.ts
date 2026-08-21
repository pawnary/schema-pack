export function tearDown(): void {}

export default function sortedStringKeysWithCache(obj: Object): string {
  const keys = Object.keys(obj).sort();

  return keys.join('');
}
