<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Checkbox } from '../../checkbox';

	type TableCheckboxIndicatorProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'class'> & {
		keepMounted?: boolean;
		children?: Snippet;
		class?: string;
	};

	let {
		keepMounted = false,
		children,
		class: className = '',
		...restProps
	}: TableCheckboxIndicatorProps = $props();
</script>

<Checkbox.Indicator {keepMounted} class={className} {...restProps}>
	{@render children?.()}
</Checkbox.Indicator>
