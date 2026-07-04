<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { useClockContext } from '../root/context';

	type ClockAxisProps = Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> & {
		class?: string;
		height?: number;
	};

	let {
		class: className = '',
		height,
		style: styleProp = '',
		...restProps
	}: ClockAxisProps = $props();

	const resolvedStyle = $derived.by(() => {
		const base = styleProp?.trim() ?? '';
		if (height === undefined || !Number.isFinite(height) || height <= 0) {
			return base.length > 0 ? base : undefined;
		}
		const axisHeight = `height:${height}px`;
		if (base.length === 0) return axisHeight;
		const withSemicolon = /;\s*$/.test(base) ? base : `${base};`;
		return `${withSemicolon}${axisHeight}`;
	});

	useClockContext();
</script>

<div
	aria-hidden="true"
	data-clock-axis
	class={className}
	style:position="absolute"
	style:top="50%"
	style:left="0"
	style:width="100%"
	style:transform="translateY(-50%)"
	style:pointer-events="none"
	style={resolvedStyle}
	{...restProps}
></div>
