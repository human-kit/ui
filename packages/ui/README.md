# @human-kit/ui

Accessible UI components for **Svelte 5**.

The components use Svelte 5 runes and have full types. The package is native
ESM, and each component has a subpath export, thus your bundler includes only
the components that you import.

**[Documentation and live demos → ui.human-kit.com](https://ui.human-kit.com)**

## Installation

```bash
npm install @human-kit/ui
# or
pnpm add @human-kit/ui
```

Svelte 5 is a peer dependency:

```json
"peerDependencies": {
  "svelte": "^5.0.0"
}
```

## Usage

Import from the root of the package:

```svelte
<script lang="ts">
	import { Dialog, ComboBox, Input, Label } from '@human-kit/ui';
</script>
```

For the smallest bundle, import one component from its subpath:

```svelte
<script lang="ts">
	import { Dialog } from '@human-kit/ui/dialog';
</script>
```

## Components

| Category    | Components                                                                    |
| ----------- | ----------------------------------------------------------------------------- |
| Overlays    | `Dialog`, `Drawer`, `Popover`, `Menu`, `Portal`                               |
| Forms       | `Input`, `TextArea`, `Label`, `Checkbox`, `Switch`, `NumberField`, `Dropzone` |
| Selection   | `ComboBox`, `Autocomplete`, `ListBox`, `Toggle`, `ToggleGroup`                |
| Date & time | `Calendar`, `Clock`, `DatePicker`, `DateRangePicker`, `TimePicker`            |
| Layout      | `Accordion`, `Collapsible`, `Tabs`, `Table`, `Tree`, `OverflowRow`            |
| Actions     | `Button`                                                                      |
| Utilities   | `LocaleProvider`, primitives, and the `cn` class function                     |

Each component also has a subpath export, for example `@human-kit/ui/calendar`.

## Styles

The components are headless: they have no CSS, and they do not need a CSS
framework. Each part accepts a `class` attribute. Each part also shows its state
in `data-*` attributes, for example `data-state`, `data-disabled`,
`data-focus-visible`, and `data-pressed`. Thus you can write the styles in plain
CSS, in Tailwind, or in a different tool. Each component page in the
documentation gives the full list of the data attributes.

```svelte
<Button.Root class="rounded-md bg-black px-3 py-1.5 text-white data-[pressed]:opacity-80">
	Save
</Button.Root>
```

The library has one dependency at run time:
[`@floating-ui/dom`](https://floating-ui.com). Only the components that put an
element against an anchor use it.

## Requirements

- Svelte `^5.0.0`
- Node.js version 20 or later

## License

[MIT](./LICENSE) © Agustin Delgado
