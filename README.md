# @human-kit/ui

[![npm](https://img.shields.io/npm/v/%40human-kit%2Fui?color=%230b7285)](https://www.npmjs.com/package/@human-kit/ui)
[![CI](https://github.com/human-kit/ui/actions/workflows/ci.yml/badge.svg)](https://github.com/human-kit/ui/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

Headless, accessible UI components for **Svelte 5**. They ship the behavior —
semantics, keyboard, focus management, positioning — and leave every pixel to you.

**[Documentation and live demos → ui.human-kit.com](https://ui.human-kit.com)**

> **Status: beta.** Published as `1.0.0-beta.x`. The public API is close to
> settled, but it can still change before `1.0.0`.

## Why

- **Headless, not unstyled-by-accident.** Components expose their state as
  `data-*` attributes (`data-state`, `data-disabled`, `data-focus-visible`, …)
  and take a `class`. No theme to override, no CSS to reset.
- **Svelte 5 native.** Runes throughout, `bind:` on every stateful prop, and an
  opt-in `controlled*` escape hatch when you want to own the state.
- **Accessibility is the product.** Focus trapping, focus restore by input
  modality, `aria-*` wiring, typeahead, roving tabindex — tested against a
  written contract, not by hand.
- **One runtime dependency.** `@floating-ui/dom`, and only where things float.
- **Ships as ESM with subpath exports**, so a bundler pulls in the one component
  you imported.

## Install

```bash
pnpm add @human-kit/ui   # npm install / yarn add also fine
```

Svelte `^5` is a peer dependency.

## First component

Every primitive is a namespace of composable parts:

```svelte
<script lang="ts">
	import { Button } from '@human-kit/ui';
	// leanest bundle: import { Button } from '@human-kit/ui/button';

	let count = $state(0);
</script>

<Button.Root class="rounded-md bg-black px-3 py-1.5 text-white" onclick={() => count++}>
	Clicked {count} times
</Button.Root>
```

That is a real `<button>` with correct semantics, focus behavior and
modality-aware focus attributes — and nothing you did not ask for.

## Components

| Category  | Components                                                                                                       |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| Form      | `Button`, `Checkbox`, `Input`, `TextArea`, `Label`, `NumberField`, `Switch`, `Toggle`, `ToggleGroup`, `Dropzone` |
| Pickers   | `Autocomplete`, `ComboBox`, `ListBox`, `Calendar`, `Clock`, `DatePicker`, `DateRangePicker`, `TimePicker`        |
| Overlays  | `Dialog`, `Drawer`, `Menu`, `Popover`, `Portal`                                                                  |
| Structure | `Accordion`, `Collapsible`, `Table`, `Tabs`, `Tree`, `OverflowRow`                                               |
| Utilities | `LocaleProvider`, `primitives`, and the `cn` class helper                                                        |

Each one is also a subpath export — `@human-kit/ui/menu`, `@human-kit/ui/table`,
and so on. Full API reference, anatomy and live demos live in
[the docs](https://ui.human-kit.com).

## Repository layout

```text
packages/ui/     the published library (@human-kit/ui)
docs/            documentation site and playground (SvelteKit)
.changeset/      versioning and release notes
scripts/         repo automation (PR flow, changeset helpers, benchmarks)
```

pnpm workspace; `packages/*` and `docs` are the members.

## Development

Requires Node.js 20+ and pnpm 9+ (the exact version is pinned via
`packageManager`, so `corepack enable` is enough).

```bash
pnpm install
pnpm run dev         # docs site + playground
```

| Command              | What it runs                                                |
| -------------------- | ----------------------------------------------------------- |
| `pnpm run test`      | The library suite, in a real Chromium (Vitest browser mode) |
| `pnpm run typecheck` | `svelte-check` over the library and the docs                |
| `pnpm run lint`      | Prettier, ESLint and the TODO-format check                  |
| `pnpm run build`     | Packages the library (`svelte-package` + `publint`)         |
| `pnpm run docs:api`  | Regenerates the API tables the docs render                  |

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the branch/PR workflow, the
changeset rules and the coding conventions.

## Releases

Versioning runs on [Changesets](https://github.com/changesets/changesets), in
prerelease mode. Any change under `packages/ui/src/**` needs a changeset — CI
fails without one.

Merging to `main` triggers `.github/workflows/release.yml`, which either pushes
a `changeset-release/main` branch with the version bump (merge it to publish) or,
when nothing is left to version, publishes to npm and pushes the tags. Changes
that only touch `docs/` never version anything; they just redeploy the site.

## Community

- [Contributing guide](./CONTRIBUTING.md)
- [Code of conduct](./CODE_OF_CONDUCT.md)
- [Security policy](./SECURITY.md) — please do not open public issues for vulnerabilities
- [Table performance benchmarks](./BENCHMARKS.md)

## License

[MIT](./LICENSE) © Agustin Delgado
