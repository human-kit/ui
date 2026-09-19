<script lang="ts">
	import { Breadcrumbs } from '../index';
	import LocaleProvider from '../../locale-provider/index';

	let {
		pages = ['Home', 'Docs', 'Components', 'Navigation', 'Breadcrumbs'],
		maxItems = undefined,
		locale = undefined,
		onExpandedChange
	}: {
		pages?: string[];
		maxItems?: number;
		locale?: string;
		onExpandedChange?: (expanded: boolean) => void;
	} = $props();

	let expanded = $state(false);
</script>

<LocaleProvider {locale}>
	<Breadcrumbs.Root {maxItems} bind:expanded {onExpandedChange} data-testid="nav">
		<Breadcrumbs.List data-testid="list">
			{#each pages as page, index (page)}
				<Breadcrumbs.Item data-testid="item">
					<Breadcrumbs.Link href="/{page.toLowerCase()}" current={index === pages.length - 1}>
						{page}
					</Breadcrumbs.Link>
				</Breadcrumbs.Item>
				{#if index === 0}
					<Breadcrumbs.Ellipsis data-testid="ellipsis" />
				{/if}
			{/each}
		</Breadcrumbs.List>
	</Breadcrumbs.Root>
</LocaleProvider>
<span data-testid="expanded">{expanded ? 'yes' : 'no'}</span>
