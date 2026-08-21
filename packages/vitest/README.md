# @schema-pack/vitest

Custom [Vitest](https://vitest.dev) matchers for asserting on the contents of a `Uint8Array` — handy when testing binary or serialization code byte by byte.

## Installation

```bash
pnpm add -D @schema-pack/vitest
```

## Requirements

- Vitest (declared as a runtime dependency, so it's installed automatically)

## Setup

Import it once from your Vitest setup file so the matchers get registered (via `expect.extend`) before your tests run:

```ts
// vitest.setup.ts
import '@schema-pack/vitest';
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./vitest.setup.ts'],
  },
});
```

Importing `@schema-pack/vitest` from any file that's part of your TypeScript program — such as your Vitest setup file — is enough for TypeScript to also pick up the ambient `Matchers` type augmentation, so `expect(...)` recognizes the new matchers. If your setup file happens to live outside that program, add the package to your `tsconfig.json`'s `types` array instead:

```json
{
  "compilerOptions": {
    "types": ["vitest", "@schema-pack/vitest"]
  }
}
```

## Matchers

All matchers operate on `Uint8Array` values passed to `expect(...)`:

- **`toBeByteAt(index, expectedByte)`** — asserts the byte at `index` equals `expectedByte`.
- **`toBeBytes(expectedBytes)`** — asserts the full byte sequence matches exactly, including length.
- **`toBeBytesBetween(start, end, expectedBytes)`** — asserts the byte range `[start, end]` matches `expectedBytes`.
- **`toBeBytesLength(expectedLength)`** — asserts `byteLength` equals `expectedLength`.
- **`toHaveBytes(expectedBytes)`** — asserts the array's leading bytes match `expectedBytes` (a prefix match).
- **`toHaveBytesFrom(start, expectedBytes)`** — asserts `expectedBytes` appear starting at offset `start`.

```ts
import { expect, test } from 'vitest';

test('matches an expected byte sequence', () => {
  const bytes = new Uint8Array([1, 2, 3]);

  expect(bytes).toBeBytes([1, 2, 3]);
  expect(bytes).toBeByteAt(0, 1);
  expect(bytes).toBeBytesLength(3);
});
```

## License

MIT
