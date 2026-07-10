<script lang="ts" generics="T extends object = object">
	import type { Snippet } from 'svelte';
	import { untrack } from 'svelte';
	import { onDestroy } from 'svelte';
	import {
		setTreeLevelContext,
		setTreeSectionContext,
		useTreeContext,
		type TreeNodeId
	} from '../root/context.svelte';
	import { getTreeRenderMode } from '../root/render-mode';
	import type { TreeSectionProps } from '../types';

	let {
		id,
		value,
		items,
		children,
		class: className = '',
		'aria-label': ariaLabel,
		...restProps
	}: TreeSectionProps<T> = $props();

	const ctx = useTreeContext();
	const renderMode = getTreeRenderMode();
	let headerId = $state<string | undefined>();
	let header = $state<Snippet | undefined>();
	let headerClassName = $state<string | undefined>();
	let headerProps = $state<Record<string, unknown> | undefined>();
	const sectionId = untrack(
		() =>
			id ??
			(typeof value === 'object' && value !== null && 'id' in value
				? (value as { id: string | number }).id
				: ctx.createGeneratedId('tree-section'))
	);

	function syncSectionRegistration() {
		ctx.registerSection({
			id: sectionId,
			ariaLabel: headerId ? undefined : (ariaLabel ?? undefined),
			labelId: headerId,
			header,
			headerClassName,
			headerProps,
			className,
			domProps: restProps
		});
	}

	syncSectionRegistration();
	$effect(() => {
		syncSectionRegistration();
	});

	setTreeLevelContext({ parentId: null, sectionId, level: 1 });
	setTreeSectionContext({
		sectionId,
		setHeader: (nextHeader) => {
			headerId = nextHeader?.id;
			header = nextHeader?.render;
			headerClassName = nextHeader?.className;
			headerProps = nextHeader?.domProps;
			syncSectionRegistration();
		},
		getHeaderId: () => headerId
	});

	onDestroy(() => {
		ctx.unregisterSection(sectionId);
	});

	const itemsArray = $derived(items ? Array.from(items) : []);

	function getCollectionKey(item: T, index: number): TreeNodeId {
		if ('id' in item) {
			const id = item.id;
			if (typeof id === 'string' || typeof id === 'number') {
				return id;
			}
		}
		return index;
	}
</script>

{#if renderMode === 'collect'}
	{#if items && children}
		{#each itemsArray as item, index (getCollectionKey(item, index))}
			{@render (children as Snippet<[T]>)(item)}
		{/each}
	{:else if children}
		{@render (children as Snippet)()}
	{/if}
{/if}
