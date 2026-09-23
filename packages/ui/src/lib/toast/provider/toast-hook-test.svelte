<script lang="ts">
	import { useToastManager } from '../index';

	// A component under the provider reaches the manager without a binding.
	const manager = useToastManager();
</script>

<button
	type="button"
	data-testid="add-from-child"
	onclick={() => manager.add({ title: 'From child' })}
>
	Add
</button>
<span data-testid="count">{manager.visibleToasts.length}</span>
