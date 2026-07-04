---
title: Dialog
description: An accessible modal dialog with trigger, portal, overlay, and content parts, plus nested dialog stacking.
---

<script>
	import { Demo, ApiReference } from '@human-kit/humandocs/components';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Controlled from './demos/controlled.svelte';
	import controlledSource from './demos/controlled.svelte?highlight';
	import Nested from './demos/nested.svelte';
	import nestedSource from './demos/nested.svelte?highlight';
	import api from './api.json';
</script>

# Dialog

An accessible modal pattern with trigger, portal, overlay, and content parts. It includes nested dialog stacking so only the topmost dialog handles global close interactions.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

All parts live inside `Dialog.Root`. `Dialog.Trigger` opens the dialog, and the modal layers — `Dialog.Overlay` and `Dialog.Content` — render inside `Dialog.Portal`. The root `children` snippet receives state helpers (`close`, `open`, `toggle`, `isOpen`).

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

Bind `open` on `Dialog.Root` to drive the dialog from outside — a trigger is optional. `defaultOpen` covers the uncontrolled case, and `onOpenChange` reports every change.

<Demo source={controlledSource}><Controlled /></Demo>

## Nested dialogs

Nest a `Dialog.Root` inside another dialog's content to build modal stacks. The stack is managed internally: overlays and panels get increasing z-indexes, and Escape or outside clicks only close the topmost dialog.

<Demo source={nestedSource}><Nested /></Demo>

## Usage guidelines

- Place all dialog parts inside `Dialog.Root`.
- Use `Dialog.Trigger` as the opener button.
- Render modal layers inside `Dialog.Portal`.
- Use `Dialog.Overlay` and `Dialog.Content` together for standard modal behavior.
- Use nested `Dialog.Root` instances when you need modal stacks; topmost behavior is handled internally.
- Use `shouldCloseOnEscape` / `shouldCloseOnInteractOutside` on `Dialog.Content` to opt out of the default close interactions.

## Accessibility

- `Dialog.Content` renders `role="dialog"` with `aria-modal="true"` while open.
- Focus is trapped inside the open dialog, and content outside it is hidden from assistive technology.
- Body scroll is locked while a modal dialog is open.
- Escape closes the topmost dialog; closing returns focus to the trigger.

## API reference

<ApiReference api={api} />
