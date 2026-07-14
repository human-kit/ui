<script lang="ts">
	import { Toggle } from '../../toggle/index.js';
	import { ToggleGroup } from '../index';
</script>

<ToggleGroup.Root aria-label="Duplicate toggles">
	<Toggle.Root value="bold">Bold</Toggle.Root>
	<Toggle.Root value="bold">Bold again</Toggle.Root>
</ToggleGroup.Root>
