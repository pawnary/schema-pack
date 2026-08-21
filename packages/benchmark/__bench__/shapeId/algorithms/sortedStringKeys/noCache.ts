export function tearDown(): void {}

export default function sortedStringKeysNoCache(obj: Object): string {
  const keys = Object.keys(obj).sort();

  return keys.join('');
}
