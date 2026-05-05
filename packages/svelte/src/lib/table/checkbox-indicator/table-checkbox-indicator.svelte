<script lang="ts">
	import { Checkbox } from '../../checkbox';
	import { getCheckboxContext } from '../../checkbox/root/context';
	import type { TableCheckboxIndicatorProps } from '../types.js';

	let {
		keepMounted = false,
		children,
		class: className = '',
		...restProps
	}: TableCheckboxIndicatorProps = $props();

	const tableCheckbox = getCheckboxContext();
	const visible = $derived(tableCheckbox ? tableCheckbox.state !== 'unchecked' : false);
</script>

{#if tableCheckbox}
	{#if keepMounted || visible}
		<span
			{...restProps}
			data-checkbox-indicator="true"
			data-checked={tableCheckbox.isChecked || undefined}
			data-unchecked={tableCheckbox.state === 'unchecked' || undefined}
			data-indeterminate={tableCheckbox.isIndeterminate || undefined}
			data-pressed={tableCheckbox.pressed || undefined}
			data-disabled={tableCheckbox.isDisabled || undefined}
			data-focused={tableCheckbox.focused || undefined}
			data-focus-visible={tableCheckbox.focusVisible || undefined}
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
