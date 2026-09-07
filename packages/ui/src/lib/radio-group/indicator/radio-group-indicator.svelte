<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { useRadioGroupItemContext } from '../item/context';

	type RadioGroupIndicatorProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'class'> & {
		/** Keeps the indicator in the DOM while the radio is not checked, for exit animations. */
		forceMount?: boolean;
		/** The mark itself. */
		children?: Snippet;
		class?: string;
	};

	let {
		forceMount = false,
		children,
		class: className = '',
		...restProps
	}: RadioGroupIndicatorProps = $props();

	const radio = useRadioGroupItemContext();
	const visible = $derived(radio.isChecked);
</script>

{#if forceMount || visible}
	<span
		{...restProps}
		data-radio-group-indicator="true"
		data-checked={radio.isChecked || undefined}
		data-unchecked={!radio.isChecked || undefined}
		data-pressed={radio.pressed || undefined}
		data-disabled={radio.isDisabled || undefined}
		data-readonly={radio.isReadOnly || undefined}
		data-required={radio.required || undefined}
		data-focused={radio.focused || undefined}
		data-focus-visible={radio.focusVisible || undefined}
		hidden={forceMount && !visible}
		aria-hidden={forceMount && !visible ? 'true' : undefined}
		class={className}
	>
		{@render children?.()}
	</span>
{/if}
