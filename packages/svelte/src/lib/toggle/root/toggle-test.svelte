<script lang="ts">
	import { Toggle } from '../index';

	type Props = {
		value?: string;
		selected?: boolean;
		defaultSelected?: boolean;
		isDisabled?: boolean;
		onChange?: (selected: boolean) => void;
		cancelClick?: boolean;
		cancelKeyDown?: boolean;
	};

	let {
		value = 'favorite',
		selected = $bindable(),
		defaultSelected = false,
		isDisabled = false,
		onChange,
		cancelClick = false,
		cancelKeyDown = false
	}: Props = $props();

	let disabledOverride = $state<boolean | null>(null);
	const disabled = $derived(disabledOverride ?? isDisabled);

	function handleClick(event: MouseEvent) {
		if (cancelClick) {
			event.preventDefault();
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (cancelKeyDown) {
			event.preventDefault();
		}
	}
</script>

<Toggle.Root
	{value}
	bind:selected
	{defaultSelected}
	isDisabled={disabled}
	{onChange}
	onclick={handleClick}
	onkeydown={handleKeyDown}
	aria-label="Favorite"
	class="inline-flex items-center"
>
	{#snippet children(state)}
		<span data-toggle-label>{state.selected ? 'Favorited' : 'Favorite'}</span>
		<span
			data-render-state="true"
			data-render-selected={state.selected || undefined}
			data-render-pressed={state.isPressed || undefined}
			data-render-hovered={state.isHovered || undefined}
			data-render-focused={state.isFocused || undefined}
			data-render-focus-visible={state.isFocusVisible || undefined}
			data-render-disabled={state.isDisabled || undefined}
		>
			{state.selected ? 'selected' : 'unselected'}
		</span>
	{/snippet}
</Toggle.Root>

<button type="button" data-set-selected onclick={() => (selected = true)}>Set selected</button>
<button type="button" data-clear-selected onclick={() => (selected = false)}>Clear selected</button>
<button type="button" data-unset-selected onclick={() => (selected = undefined)}
	>Unset selected</button
>
<button type="button" data-disable onclick={() => (disabledOverride = true)}>Disable</button>
<button type="button" data-enable onclick={() => (disabledOverride = false)}>Enable</button>
<output data-selected-state>{String(selected ?? false)}</output>
