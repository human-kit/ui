<script lang="ts">
	import { Checkbox } from '../index';

	type Props = {
		acceptChanges?: boolean;
		onCheckedChange?: (checked: boolean) => void;
	};

	let { acceptChanges = false, onCheckedChange }: Props = $props();

	let checked = $state(false);

	function handleCheckedChange(nextChecked: boolean) {
		onCheckedChange?.(nextChecked);
		if (acceptChanges) {
			checked = nextChecked;
		}
	}
</script>

<Checkbox.Root {checked} onCheckedChange={handleCheckedChange} aria-label="Accept terms">
	<Checkbox.Indicator>
		<span data-checkbox-icon="true">icon</span>
	</Checkbox.Indicator>
</Checkbox.Root>
