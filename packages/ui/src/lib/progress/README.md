# Progress

## Description

`Progress` shows the status of a task that takes time. It holds a value between `min` and `max`, or no value while the end of the task is not known. A screen reader reads its name and its value.

## Anatomy

- `Progress.Root`
- `Progress.Label`
- `Progress.Track`
- `Progress.Indicator`
- `Progress.Value`

```svelte
<Progress.Root value={31}>
	<Progress.Label>Export data</Progress.Label>
	<Progress.Value />
	<Progress.Track>
		<Progress.Indicator />
	</Progress.Track>
</Progress.Root>
```

## Usage guidelines

- Give the bar a name with `Progress.Label`, or with `aria-label` on the root.
- Give `value={null}` while the end of the task is not known. Animate the indicator with CSS on `data-indeterminate`.
- Give `format` to show the value in a unit. Without it, the text is the position in the range as a percentage.
- Read `percent` and `status` from `bind:context` for a shape of your own, such as a ring.
- Put `aria-busy="true"` on the region that the task fills. The bar says how far the task is; it does not say what the task changes.

## API reference

- `Progress.Root`
  - `value: number | null`
  - `min?: number` (0), `max?: number` (100)
  - `format?: Intl.NumberFormatOptions`
  - `getValueText?: (formattedValue, value) => string`
  - `aria-valuetext?: string`
  - `orientation?: 'horizontal' | 'vertical'` (horizontal)
  - `element?`, `context?`
- `Progress.Value`
  - `children?: Snippet<[{ formattedValue, value, status }]>`

## Accessibility

- `Progress.Root` has `role="progressbar"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow` and `aria-valuetext`.
- An indeterminate progress has no `aria-valuenow` and no `aria-valuetext`. A number for a task with no known end would be false.
- `Progress.Label` writes `aria-labelledby` on the bar. An `aria-labelledby` that you give stands.
- `Progress.Value` is `aria-hidden`: the bar already gives the value to the screen reader.
- The value follows the locale of `LocaleProvider`, and the runtime locale without one.
- The bar takes no focus, and it has no focus state. It is not in the focus contract.
- The indicator fills from the start edge of the text direction: a right-to-left page fills from the right.
