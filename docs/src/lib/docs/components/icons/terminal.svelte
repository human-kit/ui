<script lang="ts">
	import Icon from './icon.svelte';

	let { class: className = '' }: { class?: string } = $props();
</script>

<Icon class={className}>
	<polyline points="4 17 10 11 4 5" />
	<line x1="12" x2="20" y1="19" y2="19" />
</Icon>
