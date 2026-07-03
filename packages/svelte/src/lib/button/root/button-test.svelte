<script lang="ts">
	import { Button } from '../index';

	type Props = {
		disabled?: boolean;
		pending?: boolean;
		type?: 'button' | 'submit' | 'reset';
		ariaLabel?: string;
		onMouseEnter?: (event: MouseEvent) => void;
		onFocus?: (event: FocusEvent) => void;
	};

	let {
		disabled = false,
		pending: pendingProp = false,
		type = 'button',
		ariaLabel = 'Save',
		onMouseEnter,
		onFocus
	}: Props = $props();

	let pendingOverride = $state<boolean | null>(null);
	let clickCount = $state(0);
	let submitCount = $state(0);
	const pending = $derived(pendingOverride ?? pendingProp);

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
		{disabled}
		{pending}
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
				data-render-pressed={state.pressed || undefined}
				data-render-hovered={state.hovered || undefined}
				data-render-pending={state.pending || undefined}
				data-render-focused={state.focused || undefined}
				data-render-focus-visible={state.focusVisible || undefined}
			>
				{state.pressed ? 'pressed' : state.pending ? 'pending' : 'idle'}
			</span>
		{/snippet}
	</Button.Root>

	<button type="button" data-set-pending onclick={() => (pendingOverride = true)}
		>Set pending</button
	>
	<button type="button" data-clear-pending onclick={() => (pendingOverride = false)}>
		Clear pending
	</button>

	<output data-click-count>{String(clickCount)}</output>
	<output data-submit-count>{String(submitCount)}</output>
	<output data-pending-state>{String(pending)}</output>
</form>
