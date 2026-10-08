<script lang="ts">
	import { Rating } from '../index';

	type Props = {
		defaultValue?: number;
		name?: string;
		count?: number;
	};

	let { defaultValue = 2, name = 'quality', count = 5 }: Props = $props();
</script>

<form data-testid="form">
	<Rating.Root {defaultValue} {name} {count} aria-label="Quality" data-testid="root">
		{#each { length: count } as _, index (index)}
			<Rating.Item data-testid="item-{index}" style="width: 20px; height: 20px;" />
		{/each}
	</Rating.Root>
	<button type="reset" data-testid="reset">Reset</button>
</form>
