<script lang="ts">
	import { Toggle } from '../../toggle/index.js';
	import { ToggleGroup } from '../index';
	import type { ToggleGroupValue } from '../root/context.svelte';

	type Props = {
		value?: ToggleGroupValue[];
		onChange?: (value: ToggleGroupValue[]) => void;
	};

	let { value = $bindable(), onChange }: Props = $props();

	let mounted = $state(true);
	let showUnderline = $state(true);
</script>

<!-- The selected toggle is the last one, so a fallback picked behind the consumer's back
	wraps around to the first and is impossible to mistake for the value it started with. -->
{#if mounted}
	<ToggleGroup.Root bind:value disallowEmptySelection {onChange} aria-label="Text style">
		<Toggle.Root value="bold" data-testid="toggle-bold">Bold</Toggle.Root>
		<Toggle.Root value="italic" data-testid="toggle-italic">Italic</Toggle.Root>
		{#if showUnderline}
			<Toggle.Root value="underline" data-testid="toggle-underline">Underline</Toggle.Root>
		{/if}
	</ToggleGroup.Root>
{/if}

<button type="button" data-unmount-group onclick={() => (mounted = false)}>Unmount group</button>
<button type="button" data-remove-underline onclick={() => (showUnderline = false)}>
	Remove underline
</button>
<output data-current-value>{JSON.stringify(value ?? [])}</output>
