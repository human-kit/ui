<script lang="ts">
	import { theme } from '../theme.svelte.js';
	import Sun from './icons/sun.svelte';
	import Moon from './icons/moon.svelte';
</script>

<button
	type="button"
	onclick={() => theme.toggle()}
	aria-label="Toggle color theme"
	class="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
>
	<!-- Which icon shows is driven by the `.dark` class (set by the anti-FOUC
	     script before paint), not by JS state, so it never flips on hydration. -->
	<Sun class="hidden size-4 dark:block" />
	<Moon class="size-4 dark:hidden" />
</button>
