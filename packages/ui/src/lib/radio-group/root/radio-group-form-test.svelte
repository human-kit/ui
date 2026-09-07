<script lang="ts">
	import { RadioGroup } from '../index';
	import type { RadioGroupValue } from '../root/context.svelte';

	type Props = {
		defaultValue?: RadioGroupValue | null;
		onSubmitted?: (value: string | null) => void;
	};

	let { defaultValue, onSubmitted }: Props = $props();

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const data = new FormData(event.currentTarget as HTMLFormElement);
		const size = data.get('size');
		onSubmitted?.(size === null ? null : String(size));
	}
</script>

<form onsubmit={handleSubmit} data-testid="form">
	<RadioGroup.Root name="size" {defaultValue} aria-label="Size">
		<RadioGroup.Item value="small" aria-label="Small" data-testid="radio-small">
			<RadioGroup.Indicator>x</RadioGroup.Indicator>
			<span>Small</span>
		</RadioGroup.Item>
		<RadioGroup.Item value="medium" aria-label="Medium" data-testid="radio-medium">
			<RadioGroup.Indicator>x</RadioGroup.Indicator>
			<span>Medium</span>
		</RadioGroup.Item>
	</RadioGroup.Root>
	<button type="submit" data-testid="submit">Submit</button>
</form>
