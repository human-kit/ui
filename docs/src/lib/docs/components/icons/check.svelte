<script lang="ts">
	import Icon from './icon.svelte';

	let { class: className = '' }: { class?: string } = $props();
</script>

<Icon class={className}>
	<path d="M20 6 9 17l-5-5" />
</Icon>
