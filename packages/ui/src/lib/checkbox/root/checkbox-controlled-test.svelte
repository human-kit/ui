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

<!--
	`controlledChecked` states the intent: this parent owns the state and decides whether
	to apply a change, so the component must not write back. It has to be explicit now —
	passing `checked` alone reads as an ordinary one-way value and no longer implies it.
-->
<Checkbox.Root
	{checked}
	controlledChecked
	onCheckedChange={handleCheckedChange}
	aria-label="Accept terms"
>
	<Checkbox.Indicator>
		<span data-checkbox-icon="true">icon</span>
	</Checkbox.Indicator>
</Checkbox.Root>
