<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { cn } from '../../utils/cn';
	import { useCheckboxContext } from '../root/context';

	type CheckboxIndicatorProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'class'> & {
		keepMounted?: boolean;
		children?: Snippet;
		class?: string;
	};

	let { keepMounted = false, children, class: className = '', ...restProps }: CheckboxIndicatorProps =
		$props();

	const checkbox = useCheckboxContext();
	const visible = $derived(checkbox.state !== 'unchecked');
</script>

{#if keepMounted || visible}
	<span
		{...restProps}
		data-checkbox-indicator="true"
		data-checked={checkbox.isChecked || undefined}
		data-unchecked={checkbox.state === 'unchecked' || undefined}
		data-indeterminate={checkbox.isIndeterminate || undefined}
		data-pressed={checkbox.pressed || undefined}
		data-disabled={checkbox.isDisabled || undefined}
		data-readonly={checkbox.isReadOnly || undefined}
		data-required={checkbox.required || undefined}
		data-focused={checkbox.focused || undefined}
		data-focus-visible={checkbox.focusVisible || undefined}
		hidden={keepMounted && !visible}
		aria-hidden={keepMounted && !visible ? 'true' : undefined}
		class={cn('contents', className)}
	>
		{@render children?.()}
	</span>
{/if}