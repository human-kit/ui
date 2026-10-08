---
title: PinInput
description: A form field for a short code, with one real input per character, a paste that goes across the cells, the code of a message on a telephone, and a hidden input for the form.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Masked from './demos/masked.svelte';
	import maskedSource from './demos/masked.svelte?highlight';
	import Alphanumeric from './demos/alphanumeric.svelte';
	import alphanumericSource from './demos/alphanumeric.svelte?highlight';
	import api from './api.json';
</script>

# PinInput

`PinInput` is a form field for a short code: a PIN, or the verification code of a message. Each character has its own cell. Each cell is a real input, thus the telephone shows the correct keyboard and the code of a message fills the cells with one touch.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`PinInput.Root` holds the value, the focus and the keyboard. `PinInput.Cell` is one character, and you give one for each character of `length`. `PinInput.Label` names the group.

```svelte
<script>
	import { PinInput } from '@human-kit/ui';
</script>

<PinInput.Root name="code" length={6} otp>
	<PinInput.Label>Verification code</PinInput.Label>
	{#each { length: 6 } as _, index (index)}
		<PinInput.Cell />
	{/each}
</PinInput.Root>
```

## Value

Use `bind:value` to give the root your state. Use `value` with `onChange` and `controlledValue` to hold the state yourself. The root then reports each change, and it does not write `value` back.

The value is one text, and it has no holes. The characters fill the cells from the first one. A press on a cell past the first empty one goes to that one. A character that goes away takes the ones after it one cell to the left, as in a field with one box.

`onComplete` runs one time, when the last cell takes a character. Use it for the work that follows the code, for example the send of the form. `blurOnComplete` moves the focus off the last cell at the end.

## The characters each cell takes

`type` is `numeric`, `alphanumeric` or `alphabetic`. It decides which characters a cell accepts, and it sets `inputmode`: a telephone shows the numeric keyboard for a code of digits.

Give `pattern` for a test of your own. It is a regular expression for one character, and it replaces the test of the type.

A character the test refuses leaves no trace: the cell does not take it, and the focus does not move.

<Demo source={alphanumericSource}><Alphanumeric /></Demo>

## The code of a message

Give `otp` for a code that arrives in a message. Each cell takes `autocomplete="one-time-code"`, thus a telephone offers the code of the last message above the keyboard. The code arrives in one cell, and it goes across the cells from there.

A paste does the same, from the cell it starts in. The characters the type refuses are dropped, thus a code with a dash in it fills the cells of a numeric field.

Without a `PinInput.Label` and without an `aria-label`, an `otp` group takes the name "Verification code" in the locale.

## A PIN

Give `mask` for a code that the shoulder of a stranger must not read. Each cell is a password field then. `placeholder` gives an empty cell a character to show.

<Demo source={maskedSource}><Masked /></Demo>

## Style

Each cell shows its state in `data-filled`, `data-active`, `data-focused`, `data-focus-visible` and `data-invalid`. `data-active` is on the cell that takes the next character, also while nothing has the focus.

The root carries `data-complete` when each cell has a character.

The cell is the input, thus your CSS holds the text, the caret and the border. `caret-color: transparent` with a shape of your own gives you a caret that is not the one of the browser.

## Forms

Give `name` for the whole value of the field. The root renders a hidden input with the characters together, and a `<form>` reset takes the first value back. `required` marks each cell as necessary, and `invalid` marks the value as wrong.

## API reference

<ApiReference api={api} />
