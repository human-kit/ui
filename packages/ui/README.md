# @human-kit/ui

Accessible, reusable UI components for **Svelte 5**.

Built with Svelte 5 runes, typed end to end, and shipped as native ESM with
per-component subpath exports so bundlers only include what you import.

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
| Overlays    | `Dialog`, `Popover`, `Menu`, `Portal`                                         |
| Forms       | `Input`, `TextArea`, `Label`, `Checkbox`, `Switch`, `NumberField`, `Dropzone` |
| Selection   | `ComboBox`, `Autocomplete`, `ListBox`, `Toggle`, `ToggleGroup`                |
| Date & time | `Calendar`, `Clock`, `DatePicker`, `DateRangePicker`, `TimePicker`            |
| Layout      | `Accordion`, `Collapsible`, `Tabs`, `Table`, `Tree`, `OverflowRow`            |
| Actions     | `Button`                                                                      |
| Utilities   | `LocaleProvider`, primitives, and the `cn` class helper                       |

Each component is also available as a subpath export (for example
`@human-kit/ui/calendar`).

## Styling

Components ship class-based styles composed with
[`tailwind-variants`](https://www.tailwind-variants.org/) and merged with
[`tailwind-merge`](https://github.com/dcastil/tailwind-merge). A Tailwind CSS
setup in the consuming app is expected for the default look, and every component
accepts a `class` prop so you can override or extend styles.

## Requirements

- Svelte `^5.0.0`
- Node.js 20+

## License

[MIT](./LICENSE) © Agustin Delgado
