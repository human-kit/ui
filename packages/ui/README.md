# @human-kit/ui

Accessible, reusable UI components for **Svelte 5**.

Built with Svelte 5 runes, typed end to end, and shipped as native ESM with
per-component subpath exports so bundlers only include what you import.

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

Import from the package root:

```svelte
<script lang="ts">
	import { Dialog, ComboBox, Input, Label } from '@human-kit/ui';
</script>
```

Or import a single component via its subpath for the leanest bundle:

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
| Utilities   | `LocaleProvider`, primitives, and the `cn` class helper                       |

Each component is also available as a subpath export (for example
`@human-kit/ui/calendar`).

## Styling

Components are headless: they ship no CSS and assume no framework. Each part
takes a `class` and exposes its state as `data-*` attributes — `data-state`,
`data-disabled`, `data-focus-visible`, `data-pressed` and so on — so you can
style it with plain CSS, Tailwind, or anything else. Every component page in the
docs lists its full data-attribute contract.

```svelte
<Button.Root class="rounded-md bg-black px-3 py-1.5 text-white data-[pressed]:opacity-80">
	Save
</Button.Root>
```

The only runtime dependency is [`@floating-ui/dom`](https://floating-ui.com), and
only the components that position something against an anchor use it.

## Requirements

- Svelte `^5.0.0`
- Node.js 20+

## License

[MIT](./LICENSE) © Agustin Delgado
