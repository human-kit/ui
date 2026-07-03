# Contributing

Thanks for your interest in improving `@human-kit/svelte-components`. This guide
covers how to get set up and the workflow we use for changes.

## Prerequisites

- [Bun](https://bun.sh) 1.x (primary package manager and task runner)
- Node.js 20+

## Getting started

```bash
git clone https://github.com/Agustin-Delgado/svelte-components.git
cd svelte-components
bun install
bun run dev        # start the docs/demo app
```

## Repository layout

- `packages/svelte/` — the publishable library (`@human-kit/svelte-components`).
- `docs/` — documentation site and interactive playground.
- `.changeset/` — versioning and release notes.
- `scripts/` — repo automation (PR workflow, changeset helpers, TODO linting).

## Development workflow

1. Create a feature branch off `main`.
2. Make your change. Add or update tests in `packages/svelte/src/lib` alongside
   the component you touched.
3. Run the checks locally before pushing:

   ```bash
   bun run lint        # prettier + eslint + TODO format
   bun run typecheck   # svelte-check for library and docs
   bun run test        # vitest (unit + browser)
   bun run build       # package the library
   ```

4. Add a changeset describing your change (see below).
5. Open a pull request against `main`.

You can also run `bun run pr`, which formats, validates, creates/updates a
changeset, commits, pushes, and opens/updates the PR for you.

## Changesets

Any change to `packages/svelte/src/**` requires a changeset — CI enforces this.

```bash
bunx changeset
```

Pick the bump type (patch / minor / major) and write a short, user-facing
summary. The release workflow consolidates changesets into the changelog and
publishes to npm automatically once merged to `main`.

## Coding conventions

- Match existing component structure, accessibility patterns, and public API
  shape. New components should follow the conventions of existing ones.
- Keep components accessible (keyboard navigation, ARIA, focus management).
- Formatting is handled by Prettier; do not hand-format.

## Reporting bugs and requesting features

Open an issue using the provided templates. For security issues, follow
[SECURITY.md](./SECURITY.md) instead of opening a public issue.
