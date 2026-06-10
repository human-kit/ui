<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	/**
	 * Menu.Separator - A visual divider between menu items (role="separator").
	 */
	type MenuSeparatorProps = {
		/** Orientation of the separator. */
		orientation?: 'horizontal' | 'vertical';
		class?: string;
		element?: HTMLElement | null;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'role' | 'aria-orientation'>;

	let {
		orientation = 'horizontal',
		class: className = '',
		element = $bindable<HTMLElement | null>(null),
		...restProps
	}: MenuSeparatorProps = $props();
</script>

<div
	bind:this={element}
	class={className}
	role="separator"
	aria-orientation={orientation}
	data-menu-separator="true"
	data-orientation={orientation}
	{...restProps}
></div>
