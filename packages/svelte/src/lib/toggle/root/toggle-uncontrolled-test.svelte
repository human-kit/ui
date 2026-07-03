<script lang="ts">
	import { Toggle } from '../index';

	type Props = {
		defaultSelected?: boolean;
	};

	let { defaultSelected = false }: Props = $props();
</script>

<Toggle.Root {defaultSelected} aria-label="Favorite">
	{#snippet children(state)}
		<span data-render-state>{state.selected ? 'selected' : 'unselected'}</span>
	{/snippet}
</Toggle.Root>
