<script lang="ts">
	import { Checkbox } from '../../checkbox/index.js';
	import { CheckboxGroup } from '../index';
</script>

<CheckboxGroup.Root aria-label="Colors">
	<Checkbox.Root value="red" aria-label="Red">Red</Checkbox.Root>
	<Checkbox.Root value="red" aria-label="Red again">Red again</Checkbox.Root>
</CheckboxGroup.Root>
