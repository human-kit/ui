# Contributing

Thanks for your interest in improving `@human-kit/ui`. This guide
covers how to get set up and the workflow we use for changes.

## Prerequisites

- [pnpm](https://pnpm.io) 9+ (package manager and task runner)
- Node.js 20+

> The repo pins pnpm via the `packageManager` field, so `corepack enable` will
> use the exact version automatically.

## Getting started

```bash
git clone https://github.com/human-kit/ui.git
cd ui
pnpm install
pnpm run dev        # start the docs/demo app
```

## Repository layout

- `packages/ui/` — the publishable library (`@human-kit/ui`).
- `docs/` — documentation site and interactive playground.
- `.changeset/` — versioning and release notes.
- `scripts/` — repo automation (PR workflow, changeset helpers, TODO linting).

## Development workflow

1. Create a feature branch off `main`.
2. Make your change. Add or update tests in `packages/ui/src/lib` alongside
   the component you touched.
3. Run the checks locally before pushing:

   ```bash
   pnpm run lint        # prettier + eslint + TODO format
   pnpm run typecheck   # svelte-check for library and docs
   pnpm run test        # vitest (unit + browser)
   pnpm run build       # package the library
   ```

4. Add a changeset describing your change (see below).
5. Open a pull request against `main`.

You can also run `pnpm run pr`, which formats, validates, creates/updates a
changeset, commits, pushes, and opens/updates the PR for you.

## Changesets

Any change to `packages/ui/src/**` requires a changeset — CI enforces this.

```bash
pnpm exec changeset
```

Pick the bump type (patch / minor / major) and write a short, user-facing
summary. The release workflow consolidates changesets into the changelog and
publishes to npm automatically once merged to `main`.

## Coding conventions

- Match existing component structure, accessibility patterns, and public API
  shape. New components should follow the conventions of existing ones.
- Keep components accessible (keyboard navigation, ARIA, focus management).
- Formatting is handled by Prettier; do not hand-format.

## TODO files

Every `*TODO.md` in the repo uses one checklist format, validated by
`pnpm run todo:check` (which `pnpm run lint` also runs, so a malformed line
fails CI).

Each item carries, in order: status (`[ ]` / `[x]`), MoSCoW priority
(`[M]` / `[S]` / `[C]` / `[W]`), execution priority (`[P0]`–`[P3]`), area,
owner, target, and a short English description:

```markdown
- [ ] [M][P0][Area: Accessibility][Owner: @username][Target: 2026-04-30] Ensure keyboard trap works in nested dialogs.
```

## Reporting bugs and requesting features

Open an issue using the provided templates. For security issues, follow
[SECURITY.md](./SECURITY.md) instead of opening a public issue.
