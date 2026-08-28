# AGENTS.md

Repo-wide context for AI coding agents working on schema-pack. Human setup and
contribution workflow lives in [CONTRIBUTING.md](./CONTRIBUTING.md) — read this
file for the facts and conventions specific to working here as an agent.

## What this repo is

A pnpm monorepo for serialization tooling in TypeScript/JavaScript —
encoders/decoders, byte-level debugging, benchmarking, and test utilities for
binary formats. MessagePack (`@schema-pack/message-pack`) is one of the formats
implemented; the debugger and benchmark packages are deliberately
format-agnostic.

## Packages

- `packages/message-pack` (`@schema-pack/message-pack`) — MessagePack
  encoder/decoder.
- `packages/debugger` (`@schema-pack/debugger`) — format-agnostic byte-level
  debugger, driven by a `DebugSymbols` table; ships `messagePackDebugSymbols` as
  the initial table. Depends on `@schema-pack/message-pack` for real (a declared
  `dependencies` entry).
- `packages/benchmark` (`@schema-pack/benchmark`) — serializer-agnostic
  benchmark harness on top of tinybench; used in practice to compare serializers
  against other serialization libraries.
- `packages/vitest` (`@schema-pack/vitest`) — Vitest matchers for asserting on
  `Uint8Array` contents.
- `packages/schema-pack` — in progress and not yet part of the workspace. Ignore
  it for now.

## Documentation site (Fumadocs)

- Content lives in `docs/` at the repo root, not co-located with the packages
  it documents. It's Fumadocs MDX.
- A package with only a few pages gets a single top-level file
  (`docs/benchmark.mdx`, `docs/debugger.mdx`); a package with more content
  gets its own folder (`docs/message-pack/`, `docs/vitest/`).
- The site that renders `docs/` lives in `packages/website`
  (`@schema-pack/website`), a React Router app built on `fumadocs-core` /
  `fumadocs-mdx` / `fumadocs-ui`. It isn't listed under "Packages" above
  because it's the docs site itself, not a published library. Content wiring
  is in `packages/website/src/lib/source.ts`
  (`defineDocs({ dir: '../../docs' })`); adding or editing pages doesn't
  require touching that file.
- Every folder under `docs/` needs a `meta.json` with `title` and `pages`
  (controls sidebar title and page order). `"..."` inside `pages` means
  "include any remaining pages not listed explicitly" (see
  `docs/message-pack/meta.json`); that's how a subfolder like
  `configurations/`, which has no `meta.json` of its own, still shows up.
- A package folder can nest subfolders by concept, e.g.
  `docs/message-pack/configurations/encoder`,
  `docs/message-pack/configurations/decoder`,
  `docs/message-pack/extensions`, each with its own `meta.json` when it needs
  a title or explicit order.
- Every `.mdx` file needs frontmatter with `title` and `description`.
- MDX components already in use: `<Cards>` / `<Card>` for link grids (see
  `docs/index.mdx`), `<Callout type='info'>` for asides (see
  `docs/message-pack/index.mdx`).
- To document a new package: add a top-level `.mdx` (or a folder with a
  `meta.json` once it grows) under `docs/`, add its slug to
  `docs/meta.json`'s `pages` array, and add a `<Card>` to `docs/index.mdx`.

## Commands

- `pnpm install` — install dependencies
- `pnpm docs`: run the Fumadocs documentation site in dev mode
  (`packages/website`)
- `pnpm build` / `pnpm watch` — build with tsdown / build in watch mode
- `pnpm test` / `pnpm test:ci` — Vitest, watch mode / single run
- `pnpm vitest run <path>` — run a single test file
- `pnpm lint` / `pnpm lint:fix` — oxlint
- `pnpm fmt` / `pnpm fmt:fix` — oxfmt
- `pnpm tsc --noEmit` — type-check the whole workspace
- `node --expose-gc packages/<name>/__bench__/<file>.bench.ts` — run a benchmark
  directly (not wired to a script; `@schema-pack/benchmark` throws without an
  exposed GC)
- CI runs `fmt`, `lint`, `tsc --noEmit`, and `test:ci` independently on every
  pull request to `master` — run all four before considering a change done.
- `pnpm clean` runs `git clean -dfqX` under the hood (removes build output,
  `node_modules`, and tsbuildinfo files) — confirm with the user before running
  it, same as any other destructive git command.

## Code conventions

- TypeScript `strict` mode, `verbatimModuleSyntax: true` — use `import type` /
  `export type` for type-only imports and exports.
- Relative imports use the explicit `.ts` extension
  (`import Encoder from './encoder.ts'`).
- Formatting/linting via oxfmt/oxlint (`oxfmt.config.ts` / `oxlint.config.ts`).
- No dedicated error class hierarchy in `message-pack` — invalid usage throws
  plain `Error`.

## Documentation conventions (README / CONTRIBUTING files)

These were established through direct back-and-forth with the repo owner and
aren't obvious from the code alone:

- Keep tables and sections scoped to one concept — e.g. Encoder options and
  Decoder options are separate tables, not one merged table with an "applies to"
  column.

## Working in this repo

- Make only the change that was asked for. If something adjacent looks wrong or
  incomplete, say so and wait for direction instead of fixing it unprompted.
- If you're unsure whether something is in scope, ask before editing.
