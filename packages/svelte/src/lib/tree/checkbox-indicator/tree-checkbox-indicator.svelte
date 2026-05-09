<script lang="ts">
	import { Checkbox } from '../../checkbox';
	import { getCheckboxContext } from '../../checkbox/root/context';
	import type { TreeCheckboxIndicatorProps } from '../types';

	let {
		keepMounted = false,
		children,
		class: className = '',
		...restProps
	}: TreeCheckboxIndicatorProps = $props();

	const treeCheckbox = getCheckboxContext();
	const visible = $derived(treeCheckbox ? treeCheckbox.state !== 'unchecked' : false);
</script>

{#if treeCheckbox}
	{#if keepMounted || visible}
		<span
			{...restProps}
			data-tree-checkbox-indicator="true"
			data-checked={treeCheckbox.isChecked || undefined}
			data-unchecked={treeCheckbox.state === 'unchecked' || undefined}
			data-indeterminate={treeCheckbox.isIndeterminate || undefined}
			data-pressed={treeCheckbox.pressed || undefined}
			data-disabled={treeCheckbox.isDisabled || undefined}
			data-focused={treeCheckbox.focused || undefined}
			data-focus-visible={treeCheckbox.focusVisible || undefined}
			hidden={keepMounted && !visible}
			aria-hidden={keepMounted && !visible ? 'true' : undefined}
			class={className}
		>
			{@render children?.()}
		</span>
	{/if}
{:else}
	<Checkbox.Indicator {keepMounted} class={className} {...restProps}>
		{@render children?.()}
	</Checkbox.Indicator>
{/if}