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
	import { cn } from '$lib/utils/cn';
	import { useComboBoxContext } from '../root/context';

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

	const tagCtx = getContext<TagContext>(TAG_CONTEXT_KEY);
	const comboboxCtx = useComboBoxContext();

	let tagRef: HTMLSpanElement | null = $state(null);

	function handleKeydown(event: KeyboardEvent) {
		if (tagCtx.disabled) return;

		switch (event.key) {
			case 'ArrowLeft': {
				// Navigate to previous tag
				const prevTag = tagRef?.previousElementSibling as HTMLElement | null;
				if (prevTag?.hasAttribute('data-tag-id')) {
					prevTag.focus();
				}
				event.preventDefault();
				break;
			}
			case 'ArrowRight': {
				// Navigate to next tag or input
				const nextTag = tagRef?.nextElementSibling as HTMLElement | null;
				if (nextTag?.hasAttribute('data-tag-id')) {
					nextTag.focus();
				} else {
					// No more tags, focus input
					comboboxCtx.inputRef?.focus();
				}
				event.preventDefault();
				break;
			}
			case 'ArrowDown': {
				// Focus input and open combobox
				comboboxCtx.inputRef?.focus();
				comboboxCtx.open();
				event.preventDefault();
				break;
			}
			case 'Delete':
			case 'Backspace': {
				// Remove this tag and focus adjacent tag or input
				const prevTag = tagRef?.previousElementSibling as HTMLElement | null;
				const nextTag = tagRef?.nextElementSibling as HTMLElement | null;

				tagCtx.remove();

				// Focus next tag, or previous, or input
				requestAnimationFrame(() => {
					if (nextTag?.hasAttribute('data-tag-id')) {
						nextTag.focus();
					} else if (prevTag?.hasAttribute('data-tag-id')) {
						prevTag.focus();
					} else {
						comboboxCtx.inputRef?.focus();
					}
				});
				event.preventDefault();
				break;
			}
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<span
	bind:this={tagRef}
	role="listitem"
	tabindex={tagCtx.disabled ? -1 : 0}
	data-tag-id={tagCtx.id}
	data-disabled={tagCtx.disabled || undefined}
	onkeydown={handleKeydown}
	class={cn(
		'inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700',
		tagCtx.disabled && 'opacity-50',
		className
	)}
	{...restProps}
>
	{@render children()}
</span>
