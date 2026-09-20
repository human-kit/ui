<script lang="ts">
	import { Breadcrumbs } from '../index';
	import LocaleProvider from '../../locale-provider/index';

	let {
		locale = undefined,
		label = undefined,
		disabled = false,
		currentHref = true
	}: { locale?: string; label?: string; disabled?: boolean; currentHref?: boolean } = $props();

	let nav = $state<HTMLElement | null>(null);
</script>

<button type="button" data-testid="before">Before</button>
<LocaleProvider {locale}>
	<Breadcrumbs.Root data-testid="nav" aria-label={label} bind:element={nav} class="trail">
		<Breadcrumbs.List data-testid="list">
			<Breadcrumbs.Item>
				<Breadcrumbs.Link href="/" data-testid="home">Home</Breadcrumbs.Link>
				<Breadcrumbs.Separator data-testid="separator" />
			</Breadcrumbs.Item>
			<Breadcrumbs.Item>
				<Breadcrumbs.Link href="/docs" {disabled} data-testid="docs">Docs</Breadcrumbs.Link>
				<Breadcrumbs.Separator>›</Breadcrumbs.Separator>
			</Breadcrumbs.Item>
			<Breadcrumbs.Item>
				<Breadcrumbs.Link
					href={currentHref ? '/docs/breadcrumbs' : undefined}
					current
					data-testid="current"
				>
					Breadcrumbs
				</Breadcrumbs.Link>
			</Breadcrumbs.Item>
		</Breadcrumbs.List>
	</Breadcrumbs.Root>
</LocaleProvider>
<span data-testid="nav-tag">{nav?.tagName ?? 'none'}</span>
