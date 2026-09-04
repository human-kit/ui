---
title: Dialog
description: An accessible modal dialog with trigger, portal, overlay, and content parts, plus nested dialog stacking.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Nested from './demos/nested.svelte';
	import nestedSource from './demos/nested.svelte?highlight';
	import api from './api.json';
</script>

# Dialog

This is an accessible modal pattern with a trigger part, a portal part, an overlay part, and a content part. A dialog can contain a second dialog. In a stack of dialogs, only the top dialog obeys the global close interactions.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

All of the parts are in `Dialog.Root`. `Dialog.Trigger` opens the dialog. The modal layers, `Dialog.Overlay` and `Dialog.Content`, are in `Dialog.Portal`. The `children` snippet of the root receives the state functions: `close`, `open`, `toggle`, and `isOpen`.

```svelte
<script>
	import { Dialog } from '@human-kit/ui';
</script>

<Dialog.Root>
	{#snippet children({ close })}
		<Dialog.Trigger>Open</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Overlay />
			<Dialog.Content>...</Dialog.Content>
		</Dialog.Portal>
	{/snippet}
</Dialog.Root>
```

## Controlled state

Bind `open` on `Dialog.Root` to control the dialog from your own code. Then a trigger is optional. Use `defaultOpen` when the component controls the state. The `onOpenChange` prop reports each change.

## Nested dialogs

Put a `Dialog.Root` in the content of a different dialog to make a stack. The component controls the stack. Each overlay and each panel gets a higher z-index. The `Escape` key and a click outside close only the top dialog.

<Demo source={nestedSource}><Nested /></Demo>

## Usage guidelines

- Put all of the dialog parts in `Dialog.Root`.
- Use `Dialog.Trigger` as the button that opens the dialog.
- Put the modal layers in `Dialog.Portal`.
- Use `Dialog.Overlay` and `Dialog.Content` together for the usual modal behavior.
- Use nested `Dialog.Root` parts when you need a stack. The component controls which dialog is on top.
- Use `shouldCloseOnEscape` and `shouldCloseOnInteractOutside` on `Dialog.Content` to stop the default close interactions.

## Accessibility

- While the dialog is open, `Dialog.Content` has `role="dialog"` with `aria-modal="true"`.
- The focus stays in the open dialog. Assistive technology does not read the content outside the dialog.
- While a modal dialog is open, the body does not scroll.
- The `Escape` key closes the top dialog. When a dialog closes, the focus goes back to the trigger.

## API reference

<ApiReference api={api} />
