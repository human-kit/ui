<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { useClockContext } from '../root/context';

	type ClockAxisProps = Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> & {
		class?: string;
		height?: number;
	};

	let { class: className = '', ...restProps }: ClockAxisProps = $props();

	useClockContext();
</script>

<div
	aria-hidden="true"
	data-clock-axis
	class={`pointer-events-none absolute top-1/2 left-0 w-full -translate-y-1/2 ${className}`}
	{...restProps}
></div>
