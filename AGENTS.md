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

## Commands

- `pnpm install` — install dependencies
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
