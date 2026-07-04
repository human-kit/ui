<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { nav } from './nav.js';
</script>

<nav class="flex flex-col gap-6 px-4 py-6">
	{#each nav as group (group.label)}
		<div>
			<h4
				class="px-3 text-xs font-semibold tracking-wide text-gray-400 uppercase dark:text-gray-500"
			>
				{group.label}
			</h4>
			<ul class="mt-2 space-y-0.5">
				{#each group.items as item (item.slug)}
					{@const href = resolve(`/docs/${item.slug}`)}
					{@const active = page.url.pathname.replace(/\/$/, '') === `/docs/${item.slug}`}
					<li>
						<a
							{href}
							aria-current={active ? 'page' : undefined}
							class="block rounded-md px-3 py-1.5 text-sm transition-colors {active
								? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-white'
								: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-200'}"
						>
							{item.title}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/each}
</nav>
