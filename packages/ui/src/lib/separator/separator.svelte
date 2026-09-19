<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { SeparatorOrientation } from './types.js';

	type SeparatorProps = Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'class' | 'role' | 'aria-orientation'
	> & {
		/**
		 * The direction of the line. A horizontal separator sits between two blocks, one above the
		 * other. A vertical one sits between two items side by side, such as in a toolbar.
		 */
		orientation?: SeparatorOrientation;
		/**
		 * Makes the separator a visual line only. A screen reader then skips it. Use it for a line
		 * that repeats a break the content already makes, such as a border between two sections
		 * with headings. Without it, the separator is a `role="separator"` element, which a screen
		 * reader reads as a break between two groups of content.
		 */
		decorative?: boolean;
		/** The CSS class names of the element. */
		class?: string;
		/** The separator element. Use `bind:element` to read it. */
		element?: HTMLDivElement | null;
	};

	/**
	 * Separator — a line between two groups of content.
	 *
	 * It is a `role="separator"` element, which a screen reader reads as a break, with
	 * `aria-orientation` for a vertical line: a separator is horizontal unless it says otherwise.
	 * `decorative` takes the role away for a line that repeats a break the content already makes.
	 * It has no size of its own: give it a border or a background, and a width or a height.
	 */
	let {
		orientation = 'horizontal',
		decorative = false,
		class: className = '',
		element = $bindable<HTMLDivElement | null>(null),
		...restProps
	}: SeparatorProps = $props();

	let separatorRef: HTMLDivElement | null = $state(null);

	$effect(() => {
		element = separatorRef;
		return () => {
			element = null;
		};
	});
</script>

<div
	{...restProps}
	bind:this={separatorRef}
	role={decorative ? 'none' : 'separator'}
	aria-orientation={decorative || orientation === 'horizontal' ? undefined : 'vertical'}
	class={className}
	data-separator-root="true"
	data-orientation={orientation}
	data-decorative={decorative || undefined}
></div>
