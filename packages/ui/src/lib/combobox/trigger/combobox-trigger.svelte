<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { readable } from 'svelte/store';
	import { ButtonRoot } from '../../button/index.js';
	import { resolveLocalizedString } from '../../internal/localized-strings';
	import { useLocaleContextOptional } from '../../locale-provider/context';
	import { useComboBoxContext } from '../root/context';

	type ComboBoxTriggerProps = HTMLButtonAttributes & {
		class?: string;
		children?: Snippet;
	};

	let { class: className, children, tabindex = -1, ...restProps }: ComboBoxTriggerProps = $props();

	const localeContext = useLocaleContextOptional();
	const emptyLocaleStore = readable<string | undefined>(undefined);
	const localeStore = localeContext?.locale ?? emptyLocaleStore;

	const ctx = useComboBoxContext();
	const isTriggerDisabled = $derived(ctx.isDisabled || ctx.isReadOnly || ctx.isPending);
	const defaultAriaLabel = $derived(
		resolveLocalizedString(
			$localeStore,
			ctx.isOpen ? 'combobox.hideOptions' : 'combobox.showOptions'
		)
	);

	// Whether the popover was open when the current pointer press started. The
	// popover's own outside-press handling closes it on mousedown (the trigger is
	// not the popover's anchor, so it counts as "outside"); without this marker
	// the click that follows would toggle the popover right back open. The
	// snapshot is taken on pointerdown because it fires before every mousedown
	// listener (including the popover's document-level one).
	let wasOpenOnPress = false;

	function handlePointerDown() {
		wasOpenOnPress = ctx.isOpen;
	}

	function handleMouseDown(event: MouseEvent) {
		// Only prevent default so the press never steals DOM focus from the input.
		// Activation happens on click, which also works for keyboard (Enter/Space).
		event.preventDefault();
		// Fallback snapshot for environments without pointer events.
		wasOpenOnPress = wasOpenOnPress || ctx.isOpen;
	}

	function handleClick(event: MouseEvent) {
		if (isTriggerDisabled) return;

		// `detail > 0` distinguishes pointer clicks from keyboard-synthesized
		// clicks (detail === 0), which never have a matching press.
		const closedByThisPress = event.detail > 0 && wasOpenOnPress && !ctx.isOpen;
		wasOpenOnPress = false;
		if (closedByThisPress) {
			// The outside-press close already handled this interaction.
			return;
		}

		ctx.toggle();
	}
</script>

<ButtonRoot
	type="button"
	{tabindex}
	aria-label={defaultAriaLabel}
	aria-expanded={ctx.isOpen}
	aria-controls={ctx.isOpen ? `combobox-listbox-${ctx.instanceId}` : undefined}
	disabled={ctx.isDisabled || ctx.isReadOnly}
	pending={ctx.isPending}
	pressed={ctx.isOpen || undefined}
	onpointerdown={handlePointerDown}
	onmousedown={handleMouseDown}
	onclick={handleClick}
	class={className}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			data-open={ctx.isOpen || undefined}
			style:transform={ctx.isOpen ? 'rotate(180deg)' : undefined}
		>
			<path d="m6 9 6 6 6-6" />
		</svg>
	{/if}
</ButtonRoot>
