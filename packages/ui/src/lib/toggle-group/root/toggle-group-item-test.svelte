<script lang="ts">
	import { ToggleGroup } from '../index';
	import type { ToggleGroupValue } from '../root/context.svelte';

	type Props = {
		defaultValue?: ToggleGroupValue[];
		onChange?: (value: ToggleGroupValue[]) => void;
	};

	let { defaultValue, onChange }: Props = $props();
</script>

<ToggleGroup.Root
	{defaultValue}
	{onChange}
	selectionMode="multiple"
	aria-label="Text style"
	data-testid="toggle-group"
>
	<ToggleGroup.Item value="bold" data-testid="toggle-bold">Bold</ToggleGroup.Item>
	<ToggleGroup.Item value="italic" data-testid="toggle-italic">Italic</ToggleGroup.Item>
</ToggleGroup.Root>
