<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../../utils/cn';
	import { useNumberFieldContext } from '../root/context';

	type NumberFieldGroupProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class'> & {
		children?: Snippet;
		class?: string;
	};

	let { children, class: className, onmousedown, ...restProps }: NumberFieldGroupProps = $props();
	const numberField = useNumberFieldContext();

	function handleMouseDown(event: MouseEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		if (event.target instanceof HTMLInputElement) {
			onmousedown?.(event);
			return;
		}
		if (!numberField.isDisabled) {
			event.preventDefault();
			numberField.inputRef?.focus();
			numberField.syncFocusWithin();
		}
		onmousedown?.(event);
	}
</script>

<div
	{...restProps}
	role="group"
	class={cn(className)}
	data-number-field-group="true"
	data-disabled={numberField.isDisabled || undefined}
	data-readonly={numberField.isReadOnly || undefined}
	data-required={numberField.isRequired || undefined}
	data-invalid={numberField.isInvalid || undefined}
	data-focus-within={numberField.focusWithin || undefined}
	data-scrubbing={numberField.scrubbing || undefined}
	onmousedown={handleMouseDown}
>
	{@render children?.()}
</div>
