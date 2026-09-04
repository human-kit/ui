<script lang="ts">
	import { Toggle } from '../../toggle/index.js';
	import { ToggleGroup } from '../index';
	import type { ToggleGroupValue } from '../root/context.svelte';

	type Props = {
		onChange?: (value: ToggleGroupValue[]) => void;
	};

	let { onChange }: Props = $props();

	// A parent that owns the selection and refuses every change: it supplies `value` without
	// `bind:`, listens to `onChange`, and never flows a new value down.
	let owned = $state<ToggleGroupValue[]>(['bold']);
</script>

<ToggleGroup.Root value={owned} {onChange} aria-label="Text style">
	<Toggle.Root value="bold" data-testid="toggle-bold">Bold</Toggle.Root>
	<Toggle.Root value="italic" data-testid="toggle-italic">Italic</Toggle.Root>
</ToggleGroup.Root>

<!-- A new array with the same contents: the parent rendering again without changing its
	mind, which is when the supplied `value` takes the selection back. -->
<button type="button" data-rerender-parent onclick={() => (owned = [...owned])}>
	Re-render parent
</button>
