# @human-kit/ui

Headless and accessible UI components for **Svelte 5**. More than 40 components
give you the behavior, and you give them the styles.

**[Documentation and live demos → ui.human-kit.com](https://ui.human-kit.com)**

## Features

- **Headless.** No component has a style. Each part accepts a `class` attribute
  and shows its state in `data-*` attributes.
- **Accessible.** The components follow the WAI-ARIA Authoring Practices for
  the roles, the keyboard, and the focus.
- **Ready for each input.** The components work with a mouse, a touch screen,
  and a keyboard.
- **International.** `LocaleProvider` gives a locale to the dates, the times,
  and the numbers, and the built-in labels are in six languages.
- **Small.** Native ESM with one subpath export for each component, and one
  dependency at run time: `@floating-ui/dom`.

## Installation

```bash
npm install @human-kit/ui
```

Svelte `^5.0.0` is a peer dependency.

## Usage

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

Each component page in the documentation gives the anatomy, the data
attributes, and the full API reference.

## License

[MIT](./LICENSE) © Agustin Delgado
