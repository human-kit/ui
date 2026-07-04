<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { useCheckboxContext } from '../root/context';

	type CheckboxIndicatorProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'class'> & {
		forceMount?: boolean;
		children?: Snippet;
		class?: string;
	};

	let {
		forceMount = false,
		children,
		class: className = '',
		...restProps
	}: CheckboxIndicatorProps = $props();

	const checkbox = useCheckboxContext();
	const visible = $derived(checkbox.state !== 'unchecked');
</script>

{#if forceMount || visible}
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
		hidden={forceMount && !visible}
		aria-hidden={forceMount && !visible ? 'true' : undefined}
		class={className}
	>
		{@render children?.()}
	</span>
{/if}
