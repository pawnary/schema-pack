# Contributing to schema-pack

## Prerequisites

- [Node.js](https://nodejs.org) `^24.0.0`
- [pnpm](https://pnpm.io) `^11.21.0`

## Setup

```bash
git clone <repo-url>
cd schema-pack
pnpm install
```

## Project structure

This is a pnpm workspace (`pnpm-workspace.yaml`) with every package under
`packages/*`. Each package is independently versioned and published, but they
share:

- a single TypeScript config (`tsconfig.json`) with path aliases, so packages
  can reference each other's source directly during development (e.g.
  `@schema-pack/message-pack` resolves to `packages/message-pack/src/index.ts`)
  without needing a build step first;
- a single build pipeline (`tsdown.config.ts`) that builds every package to dual
  ESM/CJS output with generated type declarations, and auto-generates each
  package's `exports` map from its file structure;
- a single Vitest config (`vitest.config.ts`) that runs every package's
  `__tests__/**/*.spec.ts` files together, with the `@schema-pack/vitest`
  matchers registered globally via `vitest.setup.ts`.

## Development workflow

| Command                       | What it does                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------------- |
| `pnpm build`                  | Builds every package with tsdown (ESM + CJS + `.d.ts`, exports map, `publint` checks).      |
| `pnpm lint` / `pnpm lint:fix` | Lints the workspace with Oxlint.                                                            |
| `pnpm fmt` / `pnpm fmt:fix`   | Checks/fixes formatting with Oxfmt.                                                         |
| `pnpm test`                   | Runs the test suite with Vitest.                                                            |
| `pnpm clean`                  | Removes `dist/` and `node_modules` across the workspace — use it if you need a clean slate. |

Benchmarks (under each package's `__bench__/`) aren't wired to a script — run
them directly, exposing the garbage collector as `@schema-pack/benchmark`
requires:

```bash
node --expose-gc packages/message-pack/__bench__/encoder.bench.ts
```

## Code style

Formatting and linting are enforced by this repo's own packages — there's
nothing to configure manually. If you use VS Code, the recommended
`oxc.oxc-vscode` extension (see `.vscode/extensions.json`) formats and fixes on
save using the same config.

### Commit messages

This repo doesn't enforce a commit message format with tooling, but please
follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`,
`fix:`, `chore:`, `docs:`, `refactor:`, ...) where it makes sense. It keeps
`git log` scannable and pairs naturally with the changeset summary you'll write
for the same change.

## Adding a package

New packages live under `packages/<name>`, following the shape of the existing
ones:

- `package.json` — name it `@schema-pack/<name>`, set `"type": "module"`, and
  mirror the `main`/`module`/`types`/`exports` fields from an existing package
  (tsdown keeps `exports` in sync with the package's file structure — see
  `tsdown.config.ts`).
- `src/index.ts` — the package's public entry point.
- `__tests__/**/*.spec.ts` — picked up automatically by the root Vitest config.
- A path alias in the root `tsconfig.json`'s `compilerOptions.paths`, pointing
  `@schema-pack/<name>` at `./packages/<name>/src/index.ts`.
- A `README.md` describing the package.

`pnpm-workspace.yaml`'s `packages: - packages/*` picks up the new package
automatically — no extra registration needed there.

## Opening a pull request

- Keep PRs focused on one change (a config tweak, a docs update, a tooling
  change) — it makes review and changelog entries clearer.
- Describe _why_ the change is needed, not just what changed — that context is
  what future contributors (and changelog readers) actually need.

### Before opening a pull request

CI runs on every pull request targeting `master` and checks, independently:

- `pnpm fmt` (oxfmt)
- `pnpm lint` (oxlint)
- `pnpm tsc --noEmit`
- `pnpm test:ci` (Vitest)

Run these locally before pushing to catch issues early.

## Questions

Open an issue at
[github.com/pawnary/schema-pack/issues](https://github.com/pawnary/schema-pack/issues)
if anything here is unclear or out of date.
