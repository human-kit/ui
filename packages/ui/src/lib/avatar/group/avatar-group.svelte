<script lang="ts">
	import type { AvatarGroupProps } from '../types.js';
	import { setAvatarGroupContext, type AvatarGroupContext } from './context';

	/**
	 * Avatar.Group — a row of avatars, such as the people on a task.
	 *
	 * It is a `role="group"`: give it a name with `aria-label`, thus a screen reader user knows
	 * what the row is. `max` limits the avatars on the screen. The ones past it render nothing,
	 * and `Avatar.Count` says how many they are.
	 */
	let {
		children,
		class: className = '',
		max,
		element = $bindable<HTMLDivElement | null>(null),
		...restProps
	}: AvatarGroupProps = $props();

	let groupRef: HTMLDivElement | null = $state(null);
	let ids = $state<string[]>([]);

	const limit = $derived(max === undefined || max < 0 ? Infinity : Math.floor(max));

	const context: AvatarGroupContext = {
		get count() {
			return ids.length;
		},
		get max() {
			return limit;
		},
		get overflow() {
			return Math.max(0, ids.length - limit);
		},
		register(id) {
			ids = [...ids, id];
			return () => {
				ids = ids.filter((candidate) => candidate !== id);
			};
		},
		indexOf(id) {
			return ids.indexOf(id);
		}
	};

	setAvatarGroupContext(context);

	$effect(() => {
		element = groupRef;
		return () => {
			element = null;
		};
	});
</script>

<div
	{...restProps}
	bind:this={groupRef}
	role="group"
	class={className}
	data-avatar-group="true"
	data-overflow={context.overflow > 0 || undefined}
>
	{@render children?.()}
</div>
