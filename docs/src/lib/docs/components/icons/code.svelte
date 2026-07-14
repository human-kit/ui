<script lang="ts">
	import Icon from './icon.svelte';

	let { class: className = '' }: { class?: string } = $props();
</script>

<Icon class={className}>
	<polyline points="16 18 22 12 16 6" />
	<polyline points="8 6 2 12 8 18" />
</Icon>
