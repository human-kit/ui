<script lang="ts">
	import { Checkbox } from '../index';

	type Props = {
		defaultChecked?: boolean;
		form?: string;
	};

	let { defaultChecked = false, form }: Props = $props();
</script>

<form>
	<Checkbox.Root name="terms" {defaultChecked} {form} aria-label="Accept terms">
		<Checkbox.Indicator>
			<span data-checkbox-icon="true">icon</span>
		</Checkbox.Indicator>
	</Checkbox.Root>
</form>
