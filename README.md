# @human-kit/ui

[![npm](https://img.shields.io/npm/v/%40human-kit%2Fui?color=%230b7285)](https://www.npmjs.com/package/@human-kit/ui)
[![CI](https://github.com/human-kit/ui/actions/workflows/ci.yml/badge.svg)](https://github.com/human-kit/ui/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

This is a set of headless UI components for **Svelte 5**. Each component gives
you the behavior: the semantics, the keyboard operation, the focus control, and
the position calculation. No component gives you a style. You write all of the
CSS.

**[Documentation and live demos → ui.human-kit.com](https://ui.human-kit.com)**

> **Status: beta.** The version numbers are `1.0.0-beta.x`. The public API is
> almost stable, but it can change before version `1.0.0`.

## Why this library

- **The components have no styles, and this is correct.** Each component shows
  its state in `data-*` attributes (`data-state`, `data-disabled`,
  `data-focus-visible`), and each component accepts a `class` attribute. There
  is no theme to replace and no CSS to remove.
- **The components use Svelte 5 runes.** You can use `bind:` on each stateful
  prop. If you must hold the state in your own code, use the `controlled*`
  props.
- **Accessibility is the primary function.** The components keep the focus in
  the correct element and move the focus back by input modality. They set the
  `aria-*` attributes, and they do the typeahead and the roving tabindex. The
  tests compare this behavior to a written contract.
- **The library has one dependency at run time:** `@floating-ui/dom`. Only the
  components that float use it.
- **The package is native ESM, and each component has a subpath export.** Your
  bundler includes only the components that you import.

## Install

```bash
pnpm add @human-kit/ui   # npm install and yarn add are also correct
```

Svelte version 5 is a peer dependency. Make sure that your project has it.

## Your first component

Each component is a namespace. The namespace contains the parts that you
assemble:

```svelte
<script lang="ts">
	import { Button } from '@human-kit/ui';
	// For the smallest bundle: import { Button } from '@human-kit/ui/button';

	let count = $state(0);
</script>

<Button.Root class="rounded-md bg-black px-3 py-1.5 text-white" onclick={() => count++}>
	Clicked {count} times
</Button.Root>
```

This code makes a true `<button>` element. The element has the correct
semantics, the correct focus behavior, and the modality-aware focus attributes.
The element has nothing more.

## Components

| Category  | Components                                                                                                       |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| Form      | `Button`, `Checkbox`, `Input`, `TextArea`, `Label`, `NumberField`, `Switch`, `Toggle`, `ToggleGroup`, `Dropzone` |
| Pickers   | `Autocomplete`, `ComboBox`, `ListBox`, `Calendar`, `Clock`, `DatePicker`, `DateRangePicker`, `TimePicker`        |
| Overlays  | `Dialog`, `Drawer`, `Menu`, `Popover`, `Portal`                                                                  |
| Structure | `Accordion`, `Collapsible`, `Table`, `Tabs`, `Tree`, `OverflowRow`                                               |
| Utilities | `LocaleProvider`, `primitives`, and the `cn` class function                                                      |

Each component also has a subpath export, for example `@human-kit/ui/menu` and
`@human-kit/ui/table`. The documentation site has the full API reference, the
anatomy, and the live demos.

## Repository layout

```text
packages/ui/     the library that you install (@human-kit/ui)
docs/            the documentation site (SvelteKit)
.changeset/      the version data and the release notes
scripts/         the tools for this repository
```

This repository is a pnpm workspace. The members are `packages/*` and `docs`.

## Development

You must have Node.js version 20 or later, and pnpm version 9 or later. The
`packageManager` field holds the exact pnpm version. Run `corepack enable`, and
pnpm starts at that version.

```bash
pnpm install
pnpm run dev         # the documentation site and the playground
```

| Command              | What the command does                                                   |
| -------------------- | ----------------------------------------------------------------------- |
| `pnpm run test`      | Runs the library tests in a true Chromium browser (Vitest browser mode) |
| `pnpm run typecheck` | Runs `svelte-check` on the library and on the documentation site        |
| `pnpm run lint`      | Runs Prettier, ESLint, and the TODO format check                        |
| `pnpm run build`     | Builds the package (`svelte-package` and `publint`)                     |
| `pnpm run docs:api`  | Makes the API tables again from the source                              |

Read [CONTRIBUTING.md](./CONTRIBUTING.md) for the branch and pull request
procedure, the changeset rules, and the code conventions.

## Releases

[Changesets](https://github.com/changesets/changesets) controls the version
numbers, in prerelease mode. Each change in `packages/ui/src/**` needs a
changeset. If the changeset is not there, CI fails.

When you merge to `main`, the `.github/workflows/release.yml` workflow starts.
The workflow does one of these two operations:

- If changesets are present, the workflow pushes a `changeset-release/main`
  branch with the new version number. Merge that branch to publish.
- If no changesets are present, the workflow publishes the package to npm and
  pushes the tags.

A change that touches only `docs/` does not change a version number. It only
deploys the site again.

## Community

- [Contributing guide](./CONTRIBUTING.md)
- [Code of conduct](./CODE_OF_CONDUCT.md)
- [Security policy](./SECURITY.md) — do not report a vulnerability in a public issue
- [Table performance benchmarks](./BENCHMARKS.md)

## License

[MIT](./LICENSE) © Agustin Delgado
