<script lang="ts" module>
	export const TAG_CONTEXT_KEY = Symbol.for('combobox-tag');

	export type TagContext = {
		id: string | number;
		label: string;
		remove: () => void;
		disabled: boolean;
	};
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getContext } from 'svelte';
	import { getComboBoxTagDomId, useComboBoxContext } from '../root/context';

	/**
	 * ComboBox.Tag - Individual tag representing a selected value.
	 * Must be used inside ComboBox.Tags which provides context.
	 * Supports keyboard navigation: ArrowLeft/Right to navigate, Delete/Backspace to remove, ArrowDown to focus input.
	 */
	type ComboBoxTagProps = {
		/** Content of the tag - use ComboBox.TagRemove for remove button */
		children: Snippet;
		class?: string;
	} & Omit<HTMLAttributes<HTMLSpanElement>, 'class' | 'children'>;

	let { children, class: className, ...restProps }: ComboBoxTagProps = $props();

	const tagCtx = getContext<TagContext | undefined>(TAG_CONTEXT_KEY);
	const comboboxCtx = useComboBoxContext();

	if (!tagCtx) {
		throw new Error('ComboBox.Tag must be used within ComboBox.Tags');
	}

	/** Whether this tag has virtual focus (navigated via arrow keys) */
	const isFocused = $derived(comboboxCtx.focusedTagId === tagCtx.id);

	// Deterministic id so the input's aria-activedescendant can reference this tag
	// while it holds virtual focus. Placed after {...restProps} so it always wins.
	const tagDomId = $derived(getComboBoxTagDomId(comboboxCtx.instanceId, tagCtx.id));

	function handleMouseDown(event: MouseEvent) {
		// Prevent focus theft - tags use virtual focus only via arrow keys
		event.preventDefault();
	}
</script>

<span
	role="listitem"
	data-tag-id={tagCtx.id}
	data-disabled={tagCtx.disabled || undefined}
	data-focused={isFocused || undefined}
	onmousedown={handleMouseDown}
	class={className}
	{...restProps}
	id={tagDomId}
>
	{@render children()}
</span>
