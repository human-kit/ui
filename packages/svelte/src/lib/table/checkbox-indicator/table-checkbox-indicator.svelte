<script lang="ts">
	import { Checkbox } from '../../checkbox';
	import type { TableCheckboxIndicatorProps } from '../types.js';

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
