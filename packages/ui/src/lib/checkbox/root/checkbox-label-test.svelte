<script lang="ts">
	import { Checkbox } from '../index.ts';

	type Props = {
		readonly?: boolean;
	};

	let { readonly = false }: Props = $props();
</script>

<label for="notifications">Enable notifications</label>
<Checkbox.Root id="notifications" {readonly} aria-label="Notifications">
	<Checkbox.Indicator>
		<span data-checkbox-icon="true">icon</span>
	</Checkbox.Indicator>
</Checkbox.Root>
