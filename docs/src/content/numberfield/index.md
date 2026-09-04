---
title: NumberField
description: Composable numeric input with formatted text entry, spinbutton semantics, stepper buttons, optional wheel scrubbing, and pointer scrubbing.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Formatting from './demos/formatting.svelte';
	import formattingSource from './demos/formatting.svelte?highlight';
	import Scrub from './demos/scrub.svelte';
	import scrubSource from './demos/scrub.svelte?highlight';
	import api from './api.json';
</script>

# NumberField

This is a numeric input. The text has a locale format, the input has spinbutton semantics, and the field has step buttons. The value can also change when the user drags a pointer or turns the mouse wheel.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`NumberField.Root` gives the state to each part. `Group` contains the controls that the user sees. `Input` is the spinbutton text input. `Decrement` and `Increment` are the step buttons. `ScrubArea` adds the pointer drag control, and it can contain a `ScrubAreaCursor`.

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

## Format

`Intl.NumberFormat` makes the text that the user sees, and `formatOptions` controls it. The value in `bind:value` is always a `number` or `null`. Put the component in a `LocaleProvider` to control the locale of the format and of the text that the component reads.

<Demo source={formattingSource}><Formatting /></Demo>

## Pointer drag

`NumberField.ScrubArea` makes any element into a drag control for the value. The `allowWheelScrub` prop lets the mouse wheel change the value while the input has the focus. Both parts show `data-scrubbing` for the styles.

<Demo source={scrubSource}><Scrub /></Demo>

## Usage guidelines

- Give `NumberField.Input` an accessible name with `aria-label`, with `aria-labelledby`, or with a `<label for>` element that the user sees.
- Use `bind:value` for the state in the two directions. The value is always a `number` or `null`. The component makes the text separately.
- Put the component in a `LocaleProvider` to control the locale of the format and of the text that the component reads.
- With `allowOutOfRange={false}`, the user can edit a value that is out of the range while the input has the focus. When the input loses the focus, the value goes to `min` or to `max`.
- In a percent format, the `%` character is a localized suffix. If the user types `50`, the value becomes `50`, not `0.5`.
- Use `name` on `Root` only when the component must submit a raw numeric value in an HTML form.
- Use `incrementAriaLabel` and `decrementAriaLabel` to replace the localized default names of the two buttons.

## Accessibility

- `NumberField.Input` makes a text input with `role="spinbutton"`. When they apply, the component sets `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and `aria-valuetext`.
- The arrow keys change the value by `step`. `Shift` and the arrow keys change it by `largeStep`. `Ctrl` or `Cmd` and the arrow keys change it by `smallStep`. The `PageUp`, `PageDown`, `Home`, and `End` keys also change the value.
- The keyboard and the buttons do the same operations as the pointer drag.
- A bad value or a value out of the range sets the native custom validity on the input. Thus the form does not submit while the field is not valid.

## API reference

<ApiReference api={api} />
