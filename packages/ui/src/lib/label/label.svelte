<script lang="ts">
	import type { HTMLLabelAttributes } from 'svelte/elements';
	import type { ClassValue } from '../utils/cn';
	import { composeEventHandlers } from '../utils/compose-event-handlers';

	type LabelProps = HTMLLabelAttributes & {
		class?: ClassValue;
		/** Bindable reference to the rendered label element. */
		element?: HTMLLabelElement | null;
	};

	let {
		class: className,
		children,
		element = $bindable<HTMLLabelElement | null>(null),
		onmousedown: onMouseDownExternal,
		...props
	}: LabelProps = $props();

	let labelRef: HTMLLabelElement | null = $state(null);

	$effect(() => {
		element = labelRef;
		return () => {
			element = null;
		};
	});

	// Double-clicking a label should activate/focus its control, not start a
	// text selection on the label text (`event.detail > 1` marks repeat clicks).
	function handleMouseDown(event: MouseEvent) {
		if (event.detail > 1) {
			event.preventDefault();
		}
	}
</script>

<label
	{...props}
	bind:this={labelRef}
	data-label-root="true"
	class={className}
	onmousedown={composeEventHandlers(handleMouseDown, onMouseDownExternal ?? undefined)}
>
	{@render children?.()}
</label>
