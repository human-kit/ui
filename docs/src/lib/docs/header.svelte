<script lang="ts">
	import { resolve } from '$app/paths';
	import { theme } from './theme.svelte.js';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';
	import Github from '@lucide/svelte/icons/github';
</script>

<header
	class="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-gray-200 bg-white/80 px-4 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80"
>
	<a
		href={resolve('/')}
		class="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"
	>
		human-kit
		<span
			class="rounded-full border border-gray-200 px-2 py-0.5 text-xs font-normal text-gray-500 dark:border-gray-700 dark:text-gray-400"
		>
			beta
		</span>
	</a>

	<div class="flex items-center gap-1">
		<a
			href="https://github.com/Agustin-Delgado/svelte-components"
			target="_blank"
			rel="noreferrer"
			aria-label="GitHub repository"
			class="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
		>
			<Github class="size-4" />
		</a>
		<button
			type="button"
			onclick={() => theme.toggle()}
			aria-label={theme.dark ? 'Switch to light mode' : 'Switch to dark mode'}
			class="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
		>
			{#if theme.dark}
				<Sun class="size-4" />
			{:else}
				<Moon class="size-4" />
			{/if}
		</button>
	</div>
</header>
