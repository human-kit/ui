<script lang="ts">
	import { Checkbox } from '../index';

	type Props = {
		defaultChecked?: boolean;
	};

	let { defaultChecked = false }: Props = $props();
</script>

<form>
	<Checkbox.Root name="terms" {defaultChecked} aria-label="Accept terms">
		<Checkbox.Indicator>
			<span data-checkbox-icon="true">icon</span>
		</Checkbox.Indicator>
	</Checkbox.Root>
</form>
