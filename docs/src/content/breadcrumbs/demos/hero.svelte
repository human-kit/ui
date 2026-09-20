<script lang="ts">
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import { Breadcrumbs } from '@human-kit/ui';

	const pages = [
		{ href: '/', title: 'Home' },
		{ href: '/docs/quick-start', title: 'Docs' },
		{ href: '/docs/accessibility', title: 'Accessibility' }
	];

	const linkClass =
		'rounded-sm text-neutral-600 outline-none hover:text-neutral-900 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 data-[current=true]:font-medium data-[current=true]:text-neutral-900 dark:text-neutral-400 dark:hover:text-white dark:focus-visible:outline-white dark:data-[current=true]:text-white';
</script>

<Breadcrumbs.Root>
	<Breadcrumbs.List class="flex list-none flex-wrap items-center gap-1.5 p-0 text-sm">
		{#each pages as page (page.href)}
			<Breadcrumbs.Item class="flex items-center gap-1.5">
				<Breadcrumbs.Link
					href={page.href}
					class={linkClass}
					onclick={(event) => event.preventDefault()}
				>
					{page.title}
				</Breadcrumbs.Link>
				<Breadcrumbs.Separator class="text-neutral-400">
					<ChevronRightIcon class="size-3.5 rtl:-scale-x-100" />
				</Breadcrumbs.Separator>
			</Breadcrumbs.Item>
		{/each}
		<Breadcrumbs.Item>
			<Breadcrumbs.Link current class={linkClass}>Breadcrumbs</Breadcrumbs.Link>
		</Breadcrumbs.Item>
	</Breadcrumbs.List>
</Breadcrumbs.Root>
