<script lang="ts">
	import type { ComponentProps, Snippet } from 'svelte';
	import { ButtonRoot } from '../../button/index.js';
	import { trackInteractionModality } from '../../primitives/input-modality';
	import { composeEventHandlers } from '../../utils/compose-event-handlers';
	import { useSearchFieldContext } from '../root/context';

	type SearchFieldClearProps = Omit<
		ComponentProps<typeof ButtonRoot>,
		| 'children'
		| 'class'
		| 'type'
		| 'disabled'
		| 'tabindex'
		| 'pending'
		| 'pressed'
		| 'focusableWhenDisabled'
	> & {
		class?: string;
		/** The content of the button. If you give none, the component shows an "x" icon. */
		children?: Snippet;
	};

	/**
	 * SearchField.Clear — the button that empties the search text.
	 *
	 * It is not in the tab order, because the `Escape` key in the input does the same operation.
	 * A press on it does not take the focus: the focus stays in the input, thus the virtual
	 * keyboard of a phone stays open.
	 */
	let {
		class: className,
		children,
		'aria-label': ariaLabel,
		onclick: onClickExternal,
		onmousedown: onMouseDownExternal,
		onpointerdown: onPointerDownExternal,
		...restProps
	}: SearchFieldClearProps = $props();

	const ctx = useSearchFieldContext('SearchField.Clear');
	const isClearDisabled = $derived(ctx.isDisabled || ctx.isReadOnly || ctx.isEmpty);

	// Keep the focus where it is. Without this, the press moves the focus to the button and the
	// input loses it.
	function handleMouseDown(event: MouseEvent) {
		event.preventDefault();
	}

	// On a touch screen the input must have the focus before the press ends, or the virtual
	// keyboard closes and opens again.
	function handlePointerDown(event: PointerEvent) {
		if (isClearDisabled || event.button !== 0) return;
		trackInteractionModality(event, ctx.inputRef);
		ctx.inputRef?.focus();
	}

	function handleClick() {
		if (isClearDisabled) return;
		ctx.clear('clear-press');
		ctx.inputRef?.focus();
	}
</script>

<ButtonRoot
	{...restProps}
	type="button"
	tabindex={-1}
	aria-label={ariaLabel ?? ctx.clearAriaLabel}
	aria-controls={ctx.inputId}
	disabled={isClearDisabled}
	class={className}
	data-search-field-clear="true"
	data-empty={ctx.isEmpty || undefined}
	data-readonly={ctx.isReadOnly || undefined}
	onmousedown={composeEventHandlers(handleMouseDown, onMouseDownExternal ?? undefined)}
	onpointerdown={composeEventHandlers(handlePointerDown, onPointerDownExternal ?? undefined)}
	onclick={composeEventHandlers(handleClick, onClickExternal ?? undefined)}
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
			aria-hidden="true"
		>
			<path d="M18 6 6 18" />
			<path d="m6 6 12 12" />
		</svg>
	{/if}
</ButtonRoot>
