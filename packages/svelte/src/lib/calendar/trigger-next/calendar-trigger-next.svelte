<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { useCalendarContext } from '../root/context';

	type CalendarTriggerNextProps = Omit<HTMLButtonAttributes, 'children'> & {
		children?: Snippet;
	};

	let { children, class: className = '', ...restProps }: CalendarTriggerNextProps = $props();

	const calendar = useCalendarContext();
	const layoutVersion = calendar.layoutVersion;
	const isDisabled = $derived.by(() => {
		void $layoutVersion;
		return calendar.isDisabled;
	});

	function handleClick() {
		if (isDisabled) return;
		calendar.goToNextPage();
	}
</script>

<button
	type="button"
	class={className}
	aria-label="Next page"
	disabled={isDisabled}
	onclick={handleClick}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		Next
	{/if}
</button>
