<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { useCalendarContext } from '../root/context';

	type CalendarTriggerPreviousProps = Omit<HTMLButtonAttributes, 'children'> & {
		children?: Snippet;
	};

	let { children, class: className = '', ...restProps }: CalendarTriggerPreviousProps = $props();

	const calendar = useCalendarContext();
	const layoutVersion = calendar.layoutVersion;
	const isDisabled = $derived.by(() => {
		$layoutVersion;
		return calendar.isDisabled;
	});

	function handleClick() {
		if (isDisabled) return;
		calendar.goToPreviousPage();
	}
</script>

<button
	type="button"
	class={className}
	aria-label="Previous page"
	disabled={isDisabled}
	onclick={handleClick}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		Prev
	{/if}
</button>
