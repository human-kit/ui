<script lang="ts">
	import Separator from './separator.svelte';
	import type { SeparatorOrientation } from './types.js';

	let {
		orientation,
		decorative = false
	}: { orientation?: SeparatorOrientation; decorative?: boolean } = $props();

	let element = $state<HTMLDivElement | null>(null);
	let show = $state(true);
</script>

<p>Before</p>
{#if show}
	<Separator {orientation} {decorative} bind:element data-testid="separator" class="line" />
{/if}
<p>After</p>
<span data-testid="element-tag">{element?.tagName ?? 'none'}</span>
<button type="button" onclick={() => (show = false)}>Unmount</button>
