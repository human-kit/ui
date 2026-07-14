<script lang="ts">
	/**
	 * NumberField.ScrubAreaCursor — purely decorative.
	 *
	 * Renders consumer-provided cursor content with `aria-hidden="true"` and
	 * NumberField state mirrored as `data-*` attributes. It does NOT implement
	 * pointer lock or a virtual cursor: the native pointer moves normally
	 * while scrubbing and this element never repositions it.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../../utils/cn';
	import { useNumberFieldContext } from '../root/context';

	type NumberFieldScrubAreaCursorProps = Omit<
		HTMLAttributes<HTMLSpanElement>,
		'children' | 'class'
	> & {
		children?: Snippet;
		class?: string;
	};

	let { children, class: className, ...restProps }: NumberFieldScrubAreaCursorProps = $props();
	const numberField = useNumberFieldContext();
</script>

<span
	{...restProps}
	aria-hidden="true"
	class={cn(className)}
	data-number-field-scrub-area-cursor="true"
	data-disabled={numberField.isDisabled || undefined}
	data-readonly={numberField.isReadOnly || undefined}
	data-invalid={numberField.isInvalid || undefined}
	data-scrubbing={numberField.scrubbing || undefined}
>
	{@render children?.()}
</span>
