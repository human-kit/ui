<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setMenuGroupContext } from './context';

	/**
	 * Menu.Group - Groups related items (role="group"), labelled by an optional Menu.GroupLabel.
	 */
	type MenuGroupProps = {
		children?: Snippet;
		class?: string;
		element?: HTMLElement | null;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children' | 'role'>;

	let {
		children,
		class: className = '',
		element = $bindable<HTMLElement | null>(null),
		...restProps
	}: MenuGroupProps = $props();

	let labelId = $state<string | undefined>(undefined);

	setMenuGroupContext({
		get labelId() {
			return labelId;
		},
		setLabelId: (id) => {
			labelId = id;
		}
	});
</script>

<div
	bind:this={element}
	class={className}
	role="group"
	aria-labelledby={labelId}
	data-menu-group="true"
	{...restProps}
>
	{@render children?.()}
</div>
