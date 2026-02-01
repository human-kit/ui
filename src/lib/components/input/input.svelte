<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { ClassValue } from 'class-variance-authority/types';
	import { cn } from '$lib/utils/cn';

	type InputProps = HTMLInputAttributes & {
		class?: ClassValue;
	};

	let { class: className, ...props }: InputProps = $props();
</script>

<input
	{...props}
	class={cn(
		`bg-depth-2 sunken placeholder:text-muted-foreground hover:bg-depth-1 focus:ring-border h-8 w-full rounded-xs border px-2 text-sm shadow-xs transition-all ease-out outline-none focus:ring focus:ring-offset-1 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus:data-[invalid=true]:ring-red-500`,
		className
	)}
/>
