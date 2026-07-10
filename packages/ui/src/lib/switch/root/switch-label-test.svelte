<script lang="ts">
	import { Switch } from '../index.ts';

	type Props = {
		readonly?: boolean;
	};

	let { readonly = false }: Props = $props();
</script>

<label for="notifications">Notifications</label>
<Switch.Root id="notifications" {readonly} aria-label="Notifications">
	<Switch.Thumb />
</Switch.Root>
