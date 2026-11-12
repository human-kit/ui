<script lang="ts">
	import { Button } from '../index';

	let { opt = true }: { opt?: boolean } = $props();
	let expanded = $state(false);
</script>

<Button.Root
	aria-label="Toggle"
	aria-expanded={expanded}
	data-pressed-when-expanded={opt ? 'true' : undefined}
	onclick={() => (expanded = !expanded)}
>
	Toggle
</Button.Root>
