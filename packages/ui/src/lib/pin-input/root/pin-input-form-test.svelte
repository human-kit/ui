<script lang="ts">
	import { PinInput } from '../index';

	type Props = {
		defaultValue?: string;
		name?: string;
		length?: number;
	};

	let { defaultValue = '12', name = 'code', length = 4 }: Props = $props();
</script>

<form data-testid="form">
	<PinInput.Root {defaultValue} {name} {length} aria-label="Code" data-testid="root">
		{#each { length } as _, index (index)}
			<PinInput.Cell data-testid="cell-{index}" />
		{/each}
	</PinInput.Root>
	<button type="reset" data-testid="reset">Reset</button>
</form>
