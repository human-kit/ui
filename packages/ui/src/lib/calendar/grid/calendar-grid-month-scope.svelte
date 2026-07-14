<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setCalendarMonthIndex } from './month-scope';

	type CalendarGridMonthScopeProps = {
		monthIndex: number;
		children?: Snippet;
	};

	const props: CalendarGridMonthScopeProps = $props();
	// svelte-ignore state_referenced_locally
	setCalendarMonthIndex(props.monthIndex);
</script>

{#if props.children}
	{@render props.children()}
{/if}
