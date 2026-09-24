<script lang="ts">
	import { ColorPicker } from '../index';

	type Props = {
		defaultValue?: string;
		name?: string;
	};

	let { defaultValue = '#ff0000', name = 'brand' }: Props = $props();
</script>

<form data-testid="form">
	<ColorPicker.Root {defaultValue} {name} aria-label="Brand color" data-testid="root">
		<ColorPicker.HexField data-testid="hex" />
	</ColorPicker.Root>
	<button type="reset" data-testid="reset">Reset</button>
</form>
