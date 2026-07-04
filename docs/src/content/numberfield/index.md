---
title: NumberField
description: Composable numeric input with formatted text entry, spinbutton semantics, stepper buttons, optional wheel scrubbing, and pointer scrubbing.
---

<script>
	import { Demo, ApiReference } from '@human-kit/humandocs/components';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Formatting from './demos/formatting.svelte';
	import formattingSource from './demos/formatting.svelte?highlight';
	import Scrub from './demos/scrub.svelte';
	import scrubSource from './demos/scrub.svelte?highlight';
	import api from './api.json';
</script>

# NumberField

Composable numeric input with formatted text entry, spinbutton semantics, stepper buttons, optional wheel scrubbing, and pointer scrubbing.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`NumberField.Root` provides state to every part. `Group` wraps the visible controls, `Input` is the spinbutton text input, and `Decrement` / `Increment` are the stepper buttons. `ScrubArea` (with an optional `ScrubAreaCursor`) adds pointer scrubbing.

```svelte
<script>
	import { NumberField } from '@human-kit/ui';
</script>

<NumberField.Root>
	<NumberField.ScrubArea>
		<NumberField.ScrubAreaCursor />
	</NumberField.ScrubArea>
	<NumberField.Group>
		<NumberField.Decrement />
		<NumberField.Input />
		<NumberField.Increment />
	</NumberField.Group>
</NumberField.Root>
```

## Formatting

The visible text is formatted with `Intl.NumberFormat` via `formatOptions`, while `bind:value` always stays a raw `number | null`. Wrap the component in `LocaleProvider` to control locale-aware parsing and formatting.

<Demo source={formattingSource}><Formatting /></Demo>

## Scrubbing

`NumberField.ScrubArea` turns any element into a pointer-drag control for the value, and `allowWheelScrub` lets the mouse wheel step the value while the input is focused. Both expose `data-scrubbing` for styling.

<Demo source={scrubSource}><Scrub /></Demo>

## Usage guidelines

- Provide an accessible name for `NumberField.Input` with `aria-label`, `aria-labelledby`, or a visible `<label for>`.
- Use `bind:value` for two-way state. The value is always `number | null`; the visible input text is formatted separately.
- Wrap the component in `LocaleProvider` to control locale-aware parsing and formatting.
- With `allowOutOfRange={false}`, out-of-range drafts remain editable while focused and clamp to `min` or `max` on commit.
- Percent formatting treats `%` as a localized display suffix: typing `50` publishes `50`, not `0.5`.
- Use `name` on `Root` only when the component should submit a raw numeric value in an HTML form.
- `incrementAriaLabel` and `decrementAriaLabel` override the localized defaults when custom control names are needed.

## Accessibility

- `NumberField.Input` renders a text input with `role="spinbutton"` and exposes `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and `aria-valuetext` when applicable.
- Arrow keys step by `step`, `Shift` + arrows step by `largeStep`, `Ctrl`/`Cmd` + arrows step by `smallStep`, and `PageUp` / `PageDown` and `Home` / `End` are supported.
- Pointer scrub has equivalent input, keyboard, and button controls.
- Invalid drafts and out-of-range values set native custom validity on the visible input so form submission is blocked while the field is invalid.

## API reference

<ApiReference api={api} />
