<script lang="ts">
	import { Breadcrumbs } from '@human-kit/ui';

	const linkClass =
		'rounded-sm text-neutral-600 outline-none hover:text-neutral-900 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 data-[current=true]:font-medium data-[current=true]:text-neutral-900 data-[disabled=true]:text-neutral-400 dark:text-neutral-400 dark:hover:text-white dark:focus-visible:outline-white dark:data-[current=true]:text-white dark:data-[disabled=true]:text-neutral-600';
</script>

<Breadcrumbs.Root aria-label="Folder">
	<Breadcrumbs.List class="flex list-none flex-wrap items-center gap-1.5 p-0 text-sm">
		<Breadcrumbs.Item class="flex items-center gap-1.5">
			<Breadcrumbs.Link href="/files" class={linkClass} onclick={(event) => event.preventDefault()}>
				Files
			</Breadcrumbs.Link>
			<Breadcrumbs.Separator class="text-neutral-400" />
		</Breadcrumbs.Item>
		<Breadcrumbs.Item class="flex items-center gap-1.5">
			<Breadcrumbs.Link href="/files/shared" disabled class={linkClass}
				>Shared with me</Breadcrumbs.Link
			>
			<Breadcrumbs.Separator class="text-neutral-400" />
		</Breadcrumbs.Item>
		<Breadcrumbs.Item>
			<Breadcrumbs.Link
				href="/files/shared/q3"
				current
				class={linkClass}
				onclick={(event) => event.preventDefault()}
			>
				Q3 report
			</Breadcrumbs.Link>
		</Breadcrumbs.Item>
	</Breadcrumbs.List>
</Breadcrumbs.Root>
