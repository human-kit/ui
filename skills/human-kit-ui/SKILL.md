---
name: human-kit-ui
description: Build Svelte 5 interfaces with @human-kit/ui, a library of headless, accessible components (Dialog, Select, ComboBox, DatePicker, Menu, Table, Chart and more). Use it when a project imports @human-kit/ui, when the user asks for human-kit components, or when you write a dialog, a menu, a form field, a picker, a table or a chart in a Svelte 5 project that has @human-kit/ui installed.
---

# human-kit UI

`@human-kit/ui` gives the behavior of each component: the ARIA roles and attributes, the keyboard operation, the focus control and the position of floating elements. It gives no styles. You write all of the styles.

## Read the documentation of the installed version first

The npm package contains its documentation, one markdown file for each page of the site:

- `node_modules/@human-kit/ui/docs/README.md` is the index.
- `node_modules/@human-kit/ui/docs/<page>.md` is one page, for example `dialog.md`, `select.md` or `chart-bar.md`.

These files match the installed version. Read the page of a component before you write code with it. Each page has an anatomy example, the usage guidelines, the keyboard behavior and the full API. The API gives the props, the types, the defaults and the data attributes of each part.

If the package is not installed, use the site. Each page has a markdown twin at `https://ui.human-kit.com/docs/<page>.md`. `https://ui.human-kit.com/llms.txt` is the index, and `https://ui.human-kit.com/llms-small.txt` is the anatomy and the API of all of the pages in one file.

Do not guess a prop or a part name. The names are not always the same as in other libraries. Read the API table.

## Install

```bash
pnpm add @human-kit/ui
```

Svelte 5 is a peer dependency. The library uses runes, so do not write Svelte 4 syntax (`export let`, `$:`, `on:click`, slots).

## Imports

Each component is a namespace of parts. Import it from the root of the package, or from its subpath for the smallest bundle:

```svelte
<script lang="ts">
	import { Dialog } from '@human-kit/ui';
	// or: import { Dialog } from '@human-kit/ui/dialog';
</script>
```

Most components have parts: `Dialog.Root`, `Dialog.Trigger`, `Dialog.Content`. Some components are one element with no namespace: `Input`, `TextArea`, `Label`, `Separator`, `Dropzone`, `LocaleProvider`. The scales of the charts are at `@human-kit/ui/chart/scales/<name>`.

## Structure

Put all of the parts of a component in its `Root`. The root holds the state, and the parts read it from the context. Most parts throw an error outside their root.

Some floating parts go in a portal by themselves, for example `Popover.Content` and `Menu.Content`. Other components have a portal part, for example `Dialog.Portal`. Look at the anatomy example of the page for the correct order of the parts.

```svelte
<Dialog.Root>
	<Dialog.Trigger>Open</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 bg-black/40" />
		<Dialog.Content class="fixed top-1/2 left-1/2 -translate-1/2 rounded-lg bg-white p-6">
			<Dialog.Title>Delete the file?</Dialog.Title>
			<Dialog.Description>You cannot undo this.</Dialog.Description>
			<Dialog.Close>Cancel</Dialog.Close>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
```

## State

Each stateful component has three modes. Use the one that fits:

- `bind:open` or `bind:value`: your variable and the component stay the same. This is the usual case.
- `defaultOpen` or `defaultValue`: the component holds its own state, and you give only the start value.
- `open` or `value` with `controlledOpen` or `controlledValue`, and the change callback (`onOpenChange`, `onChange`): the component does not write the value back. Your code decides each change, so it can refuse one.

Some roots give their state to a `children` snippet, for example `{#snippet children({ close })}` in `Dialog.Root`. Use it to close a dialog from your own button.

## Styles

Each part accepts `class`, and each part shows its state in `data-*` attributes. Write the styles for these attributes. Do not add a state class from your own code:

```svelte
<Button.Root
	class="rounded-md bg-black px-3 py-1.5 text-white data-[pressed]:opacity-80 data-[focus-visible]:ring-2"
>
	Save
</Button.Root>
```

Common attributes are `data-state`, `data-disabled`, `data-focus-visible`, `data-pressed`, `data-selected` and `data-highlighted`. Each page gives the full list for each part.

Use `data-focus-visible` for the focus ring, not `:focus`. It shows only for keyboard focus.

Overlays have an enter motion and an exit motion. Write them with `data-entering` and `data-exiting`. During the exit, the element stays in the DOM until your CSS transition or CSS animation is complete.

## Forms

Give a form component a `name`, and the root makes a hidden native control that the form reads. `required`, `disabled` and `form` go to that control. Thus a `<form>` with a native submit works with no extra code.

## Things that go wrong

- The Select options are not in the DOM while the popover is closed. Give the same array to `items` on `Select.Root`, or the trigger shows the key of the value and not its text.
- Give a `Menu.Item` an `onAction` function. It runs for a click, for the `Enter` key and for the `Space` key.
- The date components use `YYYY-MM-DD` strings (the `CalendarDateValue` type), not `Date` objects.
- The text that the components make for screen readers (for example "N more" in `Avatar.Count`) comes from `LocaleProvider`. Put one around the app for a language that is not English.
- Do not put a second interactive element in a trigger part. The trigger is already a `<button>`.
- Give an accessible name to each component that has no visible label: use its `Label` part, or `aria-label`.

## Check your work

After you write a component, read its page again and compare the code with the anatomy example and the usage guidelines. Then use the keyboard in the browser: `Tab`, `Enter`, `Space`, `Escape` and the arrow keys must do what the "Keyboard" or "Accessibility" section of the page says.
