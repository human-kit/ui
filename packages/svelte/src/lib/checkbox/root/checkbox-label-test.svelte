<script lang="ts">
	import { Checkbox } from '../index.ts';
</script>

<label for="notifications">Enable notifications</label>
<Checkbox.Root id="notifications" aria-label="Notifications">
	<Checkbox.Indicator>
		<span data-checkbox-icon="true">icon</span>
	</Checkbox.Indicator>
</Checkbox.Root>
