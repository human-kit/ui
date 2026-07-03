<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getContext } from 'svelte';
	import { ButtonRoot } from '../../button/index.js';
	import { cn } from '../../utils/cn';
	import { TAG_CONTEXT_KEY, type TagContext } from '../tag/combobox-tag.svelte';

	/**
	 * ComboBox.TagRemove - Remove button for a tag.
	 * Must be used inside ComboBox.Tag.
	 */
	type ComboBoxTagRemoveProps = {
		/** Content of the button (defaults to X icon) */
		children?: Snippet;
		class?: string;
	} & Omit<HTMLButtonAttributes, 'class' | 'children' | 'type' | 'onclick' | 'aria-label'>;

	let { children, class: className, ...restProps }: ComboBoxTagRemoveProps = $props();

	const tagCtx = getContext<TagContext>(TAG_CONTEXT_KEY);

	function handleClick(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		tagCtx.remove();
	}
</script>

{#if !tagCtx.disabled}
	<ButtonRoot
		type="button"
		onclick={handleClick}
		aria-label={`Remove ${tagCtx.label}`}
		tabindex={-1}
		class={cn('ml-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600', className)}
		{...restProps}
	>
		{#if children}
			{@render children()}
		{:else}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 16 16"
				fill="currentColor"
				class="h-3.5 w-3.5"
			>
				<path
					d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z"
				/>
			</svg>
		{/if}
	</ButtonRoot>
{/if}
