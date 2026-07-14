<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { useCalendarContext } from '../root/context.svelte';

	type CalendarHeadingProps = Omit<HTMLAttributes<HTMLHeadingElement>, 'children'>;

	let { class: className = '', ...restProps }: CalendarHeadingProps = $props();

	const calendar = useCalendarContext();
	const heading = $derived(calendar.headingLabel);
</script>

<h2 class={className} aria-live="polite" {...restProps}>{heading}</h2>
