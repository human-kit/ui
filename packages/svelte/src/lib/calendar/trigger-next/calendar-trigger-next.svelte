<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { ButtonRoot } from '../../button/index.js';
	import { useCalendarContext } from '../root/context';

	type CalendarTriggerNextProps = Omit<
		HTMLButtonAttributes,
		'children' | 'class' | 'disabled' | 'aria-disabled'
	> & {
		class?: string;
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

<ButtonRoot
	type="button"
	class={className}
	aria-label="Next page"
	{isDisabled}
	onclick={handleClick}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		Next
	{/if}
</ButtonRoot>
