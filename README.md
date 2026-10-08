# [human-kit UI](https://ui.human-kit.com)

[![npm](https://img.shields.io/npm/v/%40human-kit%2Fui?color=%230b7285)](https://www.npmjs.com/package/@human-kit/ui)
[![CI](https://github.com/human-kit/ui/actions/workflows/ci.yml/badge.svg)](https://github.com/human-kit/ui/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

Headless and accessible UI components for **Svelte 5**. More than 40 components
give you the behavior, and you give them the styles.

## Features

- **Headless.** No component has a style. Each part accepts a `class` attribute
  and shows its state in `data-*` attributes, thus plain CSS, Tailwind, or a
  different tool can style it.
- **Accessible.** The components follow the patterns of the WAI-ARIA Authoring
  Practices. They set the roles and the `aria-*` attributes, and they control
  the keyboard, the focus, and the screen reader announcements.
- **Ready for each input.** The components work with a mouse, a touch screen,
  and a keyboard. The focus ring shows only when the focus comes from the
  keyboard. The tests run in a real browser.
- **International.** `LocaleProvider` gives a locale to the dates, the times,
  and the numbers. The built-in labels are in six languages, and the arrow keys
  obey a right-to-left layout.
- **Made for Svelte 5.** The components use runes, snippets, and `bind:`, and
  every prop has a type.
- **Small.** The package is native ESM with one subpath export for each
  component. The only dependency at run time is `@floating-ui/dom`.

## Documentation

The [documentation site](https://ui.human-kit.com) has the
[quick start](https://ui.human-kit.com/docs/quick-start), a live demo of each
component, the anatomy, and the full API reference.

> **Status: beta.** The version numbers are `1.0.0-beta.x`. The public API can
> change before version `1.0.0`.

## Getting started

```bash
pnpm add @human-kit/ui
```

Each component is a namespace of parts. Import it from the root of the package,
or from its subpath for the smallest bundle:

```svelte
<script lang="ts">
	import { Switch } from '@human-kit/ui/switch';
</script>

<Switch.Root
	aria-label="Notifications"
	class="h-5 w-9 rounded-full bg-neutral-300 p-0.5 data-[checked=true]:bg-black"
>
	<Switch.Thumb class="block size-4 rounded-full bg-white data-[checked=true]:translate-x-4" />
</Switch.Root>
```

## Contributing

Read the [contributing guide](./CONTRIBUTING.md). It tells you how to set up the
repository, which commands to run, how to add a changeset, and how to write the
documentation.

## Releases

The [releases page](https://ui.human-kit.com/docs/releases) shows the changes in
each version. The full history is in the
[changelog](./packages/ui/CHANGELOG.md).

## Community

- [Code of conduct](./CODE_OF_CONDUCT.md)
- [Security policy](./SECURITY.md). Do not report a vulnerability in a public
  issue.
- [Table performance benchmarks](./BENCHMARKS.md)

## License

[MIT](./LICENSE) © Agustin Delgado
