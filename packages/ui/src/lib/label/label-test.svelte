<script lang="ts">
	import Label from './label.svelte';

	let { onMouseDown }: { onMouseDown?: (event: MouseEvent) => void } = $props();

	let element = $state<HTMLLabelElement | null>(null);
	let show = $state(true);
</script>

{#if show}
	<Label for="name-input" bind:element onmousedown={onMouseDown}>Name</Label>
{/if}
<input id="name-input" type="text" />
<span data-testid="element-tag">{element?.tagName ?? 'none'}</span>
<button type="button" onclick={() => (show = false)}>Unmount label</button>
