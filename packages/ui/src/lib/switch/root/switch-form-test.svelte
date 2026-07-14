<script lang="ts">
	import { Switch } from '../index';

	type Props = {
		defaultChecked?: boolean;
	};

	let { defaultChecked = false }: Props = $props();
</script>

<form>
	<Switch.Root name="notifications" {defaultChecked} aria-label="Enable notifications">
		<Switch.Thumb />
	</Switch.Root>
</form>
