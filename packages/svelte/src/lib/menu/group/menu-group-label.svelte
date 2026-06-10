<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getMenuGroupContext } from './context';

	/**
	 * Menu.GroupLabel - Accessible label for a Menu.Group. Non-interactive.
	 */
	type MenuGroupLabelProps = {
		/** Optional explicit id (auto-generated otherwise). */
		id?: string;
		children?: Snippet;
		class?: string;
		element?: HTMLElement | null;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'>;

	const generatedId = $props.id();

	let {
		id,
		children,
		class: className = '',
		element = $bindable<HTMLElement | null>(null),
		...restProps
	}: MenuGroupLabelProps = $props();

	const labelId = $derived(id ?? generatedId);
	const groupCtx = getMenuGroupContext();

	$effect(() => {
		const current = labelId;
		groupCtx?.setLabelId(current);
		return () => groupCtx?.setLabelId(undefined);
	});
</script>

<div bind:this={element} id={labelId} class={className} data-menu-group-label="true" {...restProps}>
	{@render children?.()}
</div>
