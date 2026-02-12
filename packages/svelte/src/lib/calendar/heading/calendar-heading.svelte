<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { useCalendarContext } from '../root/context';

	type CalendarHeadingProps = Omit<HTMLAttributes<HTMLHeadingElement>, 'children'>;

	let { class: className = '', ...restProps }: CalendarHeadingProps = $props();

	const calendar = useCalendarContext();
	const layoutVersion = calendar.layoutVersion;
	const heading = $derived.by(() => {
		$layoutVersion;
		return calendar.headingLabel;
	});
</script>

<h2 class={className} aria-live="polite" {...restProps}>{heading}</h2>
