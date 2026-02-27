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

| Field        | What it does                                              |
| ------------ | --------------------------------------------------------- |
| `name`       | Internal monorepo name (`@agustin/monorepo`).             |
| `private`    | Prevents accidentally publishing the root package to npm. |
| `type`       | Uses ESM (`"module"`) for JS scripts/config.              |
| `workspaces` | Defines workspaces: `packages/*` and `docs`.              |

### Scripts (What Each One Does)

| Script        | What it does                                                |
| ------------- | ----------------------------------------------------------- |
| `dev`         | Starts the `docs` development environment using Bun filter. |
| `build`       | Packages the `@human-kit/svelte-components` library.        |
| `build:docs`  | Builds the `docs` site for production.                      |
| `test`        | Runs library tests (`packages/svelte`).                     |
| `typecheck`   | Runs type checking for library and docs.                    |
| `check`       | Runs `check` in all workspaces (`--filter '*'`).            |
| `format`      | Formats the whole repo with Prettier.                       |
| `lint:md`     | Runs Markdown lint with `markdownlint-cli2`.                |
| `lint:md:fix` | Attempts to auto-fix Markdown issues.                       |
| `todo:check`  | Validates required TODO checklist metadata format.          |
| `lint`        | Validates formatting, ESLint, and TODO metadata format.     |
| `release`     | Builds and publishes with Changesets (`changeset publish`). |
| `pr`          | Runs `scripts/pr.sh` for automated PR workflow.             |

### Root Dev Dependencies (Purpose)

| Package                        | Purpose                                                   |
| ------------------------------ | --------------------------------------------------------- |
| `@changesets/changelog-github` | Generates GitHub-integrated changelogs in releases.       |
| `@changesets/cli`              | Handles versioning and publishing for monorepo packages.  |
| `@eslint/compat`               | Compatibility helpers for modern ESLint config migration. |
| `@eslint/js`                   | Official base ESLint rules for JavaScript.                |
| `eslint`                       | Primary linter for the repository.                        |
| `eslint-config-prettier`       | Disables ESLint rules that conflict with Prettier.        |
| `eslint-plugin-svelte`         | ESLint rules for Svelte files.                            |
| `globals`                      | Global variable definitions by environment.               |
| `prettier`                     | Code formatter.                                           |
| `prettier-plugin-svelte`       | Prettier support for `.svelte` files.                     |
| `prettier-plugin-tailwindcss`  | Automatically sorts Tailwind classes.                     |
| `typescript`                   | TypeScript compiler and type system.                      |
| `typescript-eslint`            | TypeScript parser and lint rules for ESLint.              |

## Library `package.json` (`packages/svelte`) Explained

### Packaging and Quality Scripts

| Script           | What it does                                      |
| ---------------- | ------------------------------------------------- |
| `package`        | `svelte-kit sync` + `svelte-package` + `publint`. |
| `prepublishOnly` | Runs `package` before publishing to npm.          |
| `prepare`        | Syncs SvelteKit types during install/prepare.     |
| `check`          | Type-checks the library with `svelte-check`.      |
| `test`           | Runs tests with Vitest.                           |

### Runtime Dependencies

- `@floating-ui/dom`: positioning for popovers/dialogs.
- `class-variance-authority`: style variants driven by props.
- `clsx`: conditional class composition.
- `tailwind-merge`: smart Tailwind class merging.

### Peer dependency

- `svelte@^5.0.0`: the library expects Svelte 5 in consumer projects.

## Release Workflow

1. Work on a feature branch and run `bun run pr`.
   - The script formats, validates, creates/updates changeset, commits, pushes, and opens/updates the PR.
2. CI validates lint/typecheck/tests/build and enforces changeset presence for `packages/svelte/src/**` changes.
3. Merge the PR into `main`.
4. Release is automated by GitHub Actions (`.github/workflows/release.yml`) using Changesets:
   - It opens/updates a version PR (`chore: version packages`) or
   - publishes to npm when version changes are ready.

### Optional: AI-assisted changeset generation (confirm-first)

- Add label `changeset:auto` to a PR to enable automatic changeset generation in CI.
- Workflow: `.github/workflows/changeset-autogen.yml`.
- The automation only writes a changeset when missing; maintainers still review/confirm bump type and notes in PR.
- Provider order: `GEMINI_API_KEY` (preferred) -> `OPENAI_API_KEY` (fallback) -> deterministic non-AI summary.
- Local helpers:
  - `bun run changeset:auto:draft` (preview generated markdown)
  - `bun run changeset:auto:apply` (write generated file if missing)

## TODO Standard

All repository TODO files (`*TODO.md`) must use one consistent, English checklist format.

Required fields per checkbox item:

- `Status`: `[ ]` (pending) or `[x]` (done)
- `MoSCoW priority`: `[M]`, `[S]`, `[C]`, `[W]`
- `Execution priority`: `[P0]`, `[P1]`, `[P2]`, `[P3]`
- `Area/component`: `[Area: ...]`
- `Owner`: `[Owner: ...]`
- `Target date/milestone`: `[Target: ...]`
- `Description`: short English sentence

Canonical line template:

`- [ ] [M][P0][Area: Accessibility][Owner: @username][Target: 2026-04-30] Ensure keyboard trap works in nested dialogs.`

Validation:

- Run `bun run todo:check` to validate TODO formatting.
- `bun run lint` includes TODO validation and will fail on format violations.

## Tech Stack

- Svelte 5
- SvelteKit
- Vite 7
- TypeScript
- TailwindCSS 4
- Vitest
- Changesets
