<script lang="ts">
	import { Breadcrumbs } from '@human-kit/ui';

	// Real pages of this site: the prerender follows every link it finds.
	const pages = [
		{ href: '/', title: 'Home' },
		{ href: '/docs/quick-start', title: 'Docs' },
		{ href: '/docs/about', title: 'About' },
		{ href: '/docs/accessibility', title: 'Accessibility' },
		{ href: '/docs/breadcrumbs', title: 'Breadcrumbs' }
	];

	const linkClass =
		'rounded-sm text-neutral-600 outline-none hover:text-neutral-900 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 data-[current=true]:font-medium data-[current=true]:text-neutral-900 dark:text-neutral-400 dark:hover:text-white dark:focus-visible:outline-white dark:data-[current=true]:text-white';
</script>

<Breadcrumbs.Root maxItems={3}>
	<Breadcrumbs.List class="flex list-none flex-wrap items-center gap-1.5 p-0 text-sm">
		{#each pages as page, index (page.href)}
			<Breadcrumbs.Item class="flex items-center gap-1.5">
				<Breadcrumbs.Link
					href={page.href}
					current={index === pages.length - 1}
					class={linkClass}
					onclick={(event) => event.preventDefault()}
				>
					{page.title}
				</Breadcrumbs.Link>
				{#if index < pages.length - 1}
					<Breadcrumbs.Separator class="text-neutral-400" />
				{/if}
			</Breadcrumbs.Item>
			{#if index === 0}
				<Breadcrumbs.Ellipsis
					itemClass="flex items-center gap-1.5"
					class="rounded-sm px-1 text-neutral-600 outline-none hover:text-neutral-900 data-[focus-visible=true]:outline-solid data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-neutral-900 dark:text-neutral-400 dark:hover:text-white dark:data-[focus-visible=true]:outline-white"
				>
					{#snippet separator()}
						<Breadcrumbs.Separator class="text-neutral-400" />
					{/snippet}
				</Breadcrumbs.Ellipsis>
			{/if}
		{/each}
	</Breadcrumbs.List>
</Breadcrumbs.Root>
