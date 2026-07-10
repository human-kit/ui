<script lang="ts">
	import { Switch } from '../index';

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

<Switch.Root {checked} onCheckedChange={handleCheckedChange} aria-label="Enable notifications">
	<Switch.Thumb />
</Switch.Root>
