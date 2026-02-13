# Svelte Components Monorepo

Monorepo for accessible, reusable UI components for Svelte 5.
This repository contains the publishable library and the docs/demo app.

## Quick Overview

- npm library: `@human-kit/svelte-components` (in `packages/svelte`).
- Docs/demo app: `docs` (SvelteKit + Vite).
- Versioning and releases: `.changeset`.
- PR automation: `scripts/pr.sh`.

## Project Structure

```text
.
|- packages/
|  |- svelte/          # publishable package @human-kit/svelte-components
|- docs/               # documentation site and playground
|- .changeset/         # semantic versioning and release notes
|- scripts/            # utility scripts (e.g. PR workflow)
|- package.json        # monorepo orchestration
|- bun.lock            # Bun lockfile
```

## Components Exported by the Library

- `Calendar`
- `ComboBox`
- `Dialog`
- `Input`
- `Label`
- `ListBox`
- `LocaleProvider`
- `Popover`
- `Portal`
- `primitives` and utilities (`cn`)

## Package Installation (Consumers)

```bash
npm install @human-kit/svelte-components
```

Quick usage:

```svelte
<script lang="ts">
  import { ComboBox, Dialog, Input, Label } from '@human-kit/svelte-components';
</script>
```

## Local Development

Recommended requirements:

- Bun 1.x
- Node.js 20+

Install and basic commands:

```bash
bun install
bun run dev
```

## Root `package.json` Explained

### Main Fields

| Field | What it does |
| --- | --- |
| `name` | Internal monorepo name (`@agustin/monorepo`). |
| `private` | Prevents accidentally publishing the root package to npm. |
| `type` | Uses ESM (`"module"`) for JS scripts/config. |
| `workspaces` | Defines workspaces: `packages/*` and `docs`. |

### Scripts (What Each One Does)

| Script | What it does |
| --- | --- |
| `dev` | Starts the `docs` development environment using Bun filter. |
| `build` | Packages the `@human-kit/svelte-components` library. |
| `build:docs` | Builds the `docs` site for production. |
| `test` | Runs library tests (`packages/svelte`). |
| `typecheck` | Runs type checking for library and docs. |
| `check` | Runs `check` in all workspaces (`--filter '*'`). |
| `format` | Formats the whole repo with Prettier. |
| `lint:md` | Runs Markdown lint with `markdownlint-cli2`. |
| `lint:md:fix` | Attempts to auto-fix Markdown issues. |
| `lint` | Validates formatting (`prettier --check`) and then runs ESLint. |
| `release` | Builds and publishes with Changesets (`changeset publish`). |
| `pr` | Runs `scripts/pr.sh` for automated PR workflow. |

### Root Dev Dependencies (Purpose)

| Package | Purpose |
| --- | --- |
| `@changesets/changelog-github` | Generates GitHub-integrated changelogs in releases. |
| `@changesets/cli` | Handles versioning and publishing for monorepo packages. |
| `@eslint/compat` | Compatibility helpers for modern ESLint config migration. |
| `@eslint/js` | Official base ESLint rules for JavaScript. |
| `eslint` | Primary linter for the repository. |
| `eslint-config-prettier` | Disables ESLint rules that conflict with Prettier. |
| `eslint-plugin-svelte` | ESLint rules for Svelte files. |
| `globals` | Global variable definitions by environment. |
| `prettier` | Code formatter. |
| `prettier-plugin-svelte` | Prettier support for `.svelte` files. |
| `prettier-plugin-tailwindcss` | Automatically sorts Tailwind classes. |
| `typescript` | TypeScript compiler and type system. |
| `typescript-eslint` | TypeScript parser and lint rules for ESLint. |

## Library `package.json` (`packages/svelte`) Explained

### Packaging and Quality Scripts

| Script | What it does |
| --- | --- |
| `package` | `svelte-kit sync` + `svelte-package` + `publint`. |
| `prepublishOnly` | Runs `package` before publishing to npm. |
| `prepare` | Syncs SvelteKit types during install/prepare. |
| `check` | Type-checks the library with `svelte-check`. |
| `test` | Runs tests with Vitest. |

### Runtime Dependencies

- `@floating-ui/dom`: positioning for popovers/dialogs.
- `class-variance-authority`: style variants driven by props.
- `clsx`: conditional class composition.
- `tailwind-merge`: smart Tailwind class merging.

### Peer dependency

- `svelte@^5.0.0`: the library expects Svelte 5 in consumer projects.

## Release Workflow

1. Make changes in `packages/svelte` or `docs`.
2. Create a changeset (`bunx changeset`).
3. Merge to the main branch.
4. Run `bun run release` to publish through Changesets.

## Tech Stack

- Svelte 5
- SvelteKit
- Vite 7
- TypeScript
- TailwindCSS 4
- Vitest
- Changesets
