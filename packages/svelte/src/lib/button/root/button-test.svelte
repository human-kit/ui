<script lang="ts">
	import { Button } from '../index';

	type Props = {
		isDisabled?: boolean;
		isPending?: boolean;
		type?: 'button' | 'submit' | 'reset';
		ariaLabel?: string;
		onMouseEnter?: (event: MouseEvent) => void;
		onFocus?: (event: FocusEvent) => void;
	};

	let {
		isDisabled = false,
		isPending = false,
		type = 'button',
		ariaLabel = 'Save',
		onMouseEnter,
		onFocus
	}: Props = $props();

	let pending = $state(false);
	let clickCount = $state(0);
	let submitCount = $state(0);

	$effect(() => {
		pending = isPending;
	});

	function handleClick() {
		clickCount += 1;
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitCount += 1;
	}
</script>

<form onsubmit={handleSubmit}>
	<label for="name">Name</label>
	<input id="name" type="text" />

	<Button.Root
		{type}
		{isDisabled}
		isPending={pending}
		onclick={handleClick}
		onmouseenter={onMouseEnter}
		onfocus={onFocus}
		aria-label={ariaLabel}
		class="inline-flex items-center"
	>
		{#snippet children(state)}
			<span data-button-label>{pending ? 'Saving' : 'Save'}</span>
			<span
				data-render-state="true"
				data-render-pressed={state.isPressed || undefined}
				data-render-hovered={state.isHovered || undefined}
				data-render-pending={state.isPending || undefined}
				data-render-focused={state.isFocused || undefined}
				data-render-focus-visible={state.isFocusVisible || undefined}
			>
				{state.isPressed ? 'pressed' : state.isPending ? 'pending' : 'idle'}
			</span>
		{/snippet}
	</Button.Root>

	<button type="button" data-set-pending onclick={() => (pending = true)}>Set pending</button>
	<button type="button" data-clear-pending onclick={() => (pending = false)}>Clear pending</button>

	<output data-click-count>{String(clickCount)}</output>
	<output data-submit-count>{String(submitCount)}</output>
	<output data-pending-state>{String(pending)}</output>
</form>
