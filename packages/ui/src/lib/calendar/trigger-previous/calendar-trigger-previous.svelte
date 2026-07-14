<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { ButtonRoot } from '../../button/index.js';
	import { resolveLocalizedString } from '../../internal/localized-strings';
	import { useCalendarContext } from '../root/context.svelte';

	type CalendarTriggerPreviousProps = Omit<
		HTMLButtonAttributes,
		'children' | 'class' | 'disabled' | 'aria-disabled'
	> & {
		class?: string;
		children?: Snippet;
	};

	let { children, class: className = '', ...restProps }: CalendarTriggerPreviousProps = $props();

	const calendar = useCalendarContext();
	// Also disabled when the previous page is entirely before `minValue`, so
	// users cannot navigate forever into fully-disabled months.
	const isDisabled = $derived(calendar.isDisabled || calendar.isPreviousPageDisabled);
	const defaultAriaLabel = $derived(
		resolveLocalizedString(calendar.locale, 'calendar.previousPage')
	);

	function handleClick() {
		if (isDisabled) return;
		calendar.goToPreviousPage();
	}
</script>

<ButtonRoot
	type="button"
	class={className}
	aria-label={defaultAriaLabel}
	disabled={isDisabled}
	onclick={handleClick}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		Prev
	{/if}
</ButtonRoot>
