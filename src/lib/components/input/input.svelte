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
		`h-8 w-full rounded-xs border bg-depth-2 px-2 text-sm sunken shadow-xs transition-all ease-out outline-none placeholder:text-muted-foreground hover:bg-depth-1 focus:ring focus:ring-border focus:ring-offset-1 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus:data-[invalid=true]:ring-red-500`,
		className
	)}
/>
