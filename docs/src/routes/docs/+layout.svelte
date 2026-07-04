<script lang="ts">
	import Header from '$lib/docs/header.svelte';
	import Sidebar from '$lib/docs/sidebar.svelte';
	import Toc from '$lib/docs/toc.svelte';

	let { children } = $props();
</script>

<div class="min-h-screen bg-white dark:bg-gray-950">
	<Header />

	<div class="mx-auto flex w-full max-w-screen-2xl">
		<!-- Sidebar -->
		<aside
			class="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-gray-200 md:block dark:border-gray-800"
		>
			<Sidebar />
		</aside>

		<!-- Content -->
		<main class="min-w-0 flex-1 px-6 py-10 lg:px-12">
			{@render children()}
		</main>

		<!-- On this page -->
		<aside
			class="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 overflow-y-auto px-4 py-10 xl:block"
		>
			<Toc />
		</aside>
	</div>
</div>
