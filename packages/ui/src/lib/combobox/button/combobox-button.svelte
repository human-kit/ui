<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import ComboBoxTrigger from '../trigger/combobox-trigger.svelte';

	/**
	 * ComboBox.Button - Compatibility alias for ComboBox.Trigger.
	 * Identical props, behavior, and rendered attributes; kept as a separate part
	 * name for backwards compatibility. Prefer ComboBox.Trigger in new code.
	 */
	type ComboBoxButtonProps = ComponentProps<typeof ComboBoxTrigger>;

	let props: ComboBoxButtonProps = $props();
</script>

<ComboBoxTrigger {...props} />
