<script lang="ts">
	import type { HTMLLabelAttributes } from 'svelte/elements';
	import type { ClassValue } from 'class-variance-authority/types';
	import { cn } from '../utils/cn';

	type LabelProps = HTMLLabelAttributes & {
		class?: ClassValue;
	};

	let { class: className, children, ...props }: LabelProps = $props();
</script>

<label
	{...props}
	class={cn(
		`text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70`,
		className
	)}
>
	{@render children?.()}
</label>
