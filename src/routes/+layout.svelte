<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Svelte Components</title>
	<meta name="description" content="A collection of Svelte 5 UI components" />
</svelte:head>

{@render children()}
