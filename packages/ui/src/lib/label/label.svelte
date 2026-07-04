<script lang="ts">
	import type { HTMLLabelAttributes } from 'svelte/elements';
	import type { ClassValue } from '../utils/cn';

	type LabelProps = HTMLLabelAttributes & {
		class?: ClassValue;
	};

	let { class: className, children, ...props }: LabelProps = $props();
</script>

<label
	{...props}
	class={className}
>
	{@render children?.()}
</label>
