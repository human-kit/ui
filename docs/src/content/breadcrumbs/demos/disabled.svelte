<script lang="ts">
	import { Breadcrumbs } from '@human-kit/ui';

	const linkClass =
		'rounded-sm text-neutral-600 outline-none hover:text-neutral-900 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 data-[current=true]:font-medium data-[current=true]:text-neutral-900 data-[disabled=true]:text-neutral-400 dark:text-neutral-400 dark:hover:text-white dark:focus-visible:outline-white dark:data-[current=true]:text-white dark:data-[disabled=true]:text-neutral-600';
</script>

<Breadcrumbs.Root>
	<Breadcrumbs.List class="flex list-none flex-wrap items-center gap-1.5 p-0 text-sm">
		<Breadcrumbs.Item class="flex items-center gap-1.5">
			<Breadcrumbs.Link href="/" class={linkClass} onclick={(event) => event.preventDefault()}>
				Home
			</Breadcrumbs.Link>
			<Breadcrumbs.Separator class="text-neutral-400" />
		</Breadcrumbs.Item>
		<Breadcrumbs.Item class="flex items-center gap-1.5">
			<Breadcrumbs.Link href="/docs/quick-start" disabled class={linkClass}>Docs</Breadcrumbs.Link>
			<Breadcrumbs.Separator class="text-neutral-400" />
		</Breadcrumbs.Item>
		<Breadcrumbs.Item>
			<Breadcrumbs.Link
				href="/docs/breadcrumbs"
				current
				class={linkClass}
				onclick={(event) => event.preventDefault()}
			>
				Breadcrumbs
			</Breadcrumbs.Link>
		</Breadcrumbs.Item>
	</Breadcrumbs.List>
</Breadcrumbs.Root>
