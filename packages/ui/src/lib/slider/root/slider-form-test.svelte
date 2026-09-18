<script lang="ts">
	import { Slider } from '../index';
	import type { SliderChangeDetails, SliderValue } from '../types';

	type Props = {
		defaultValue?: SliderValue;
		thumbNames?: string[];
		onChange?: (value: SliderValue, details: SliderChangeDetails) => void;
	};

	let { defaultValue = 0, thumbNames, onChange }: Props = $props();

	const thumbCount = $derived(Array.isArray(defaultValue) ? defaultValue.length : 1);
</script>

<form>
	<Slider.Root name="price" {defaultValue} {onChange} aria-label="Price">
		<Slider.Track data-testid="track" style="width: 200px; height: 8px;">
			<Slider.Fill />
			{#each { length: thumbCount } as _, i (i)}
				<Slider.Thumb name={thumbNames?.[i]} style="width: 16px; height: 16px;" />
			{/each}
		</Slider.Track>
	</Slider.Root>
</form>
