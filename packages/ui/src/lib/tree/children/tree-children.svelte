<script lang="ts">
	import { getTreeRenderMode } from '../root/render-mode';
	import { useTreeItemBuildContext } from '../item/build-context';
	import type { TreeChildrenProps } from '../types';

	let { children }: TreeChildrenProps = $props();

	const renderMode = getTreeRenderMode();
	const item = renderMode === 'collect' ? useTreeItemBuildContext() : undefined;

	if (renderMode === 'collect') {
		item?.markHasChildren();
	}
</script>

{#if renderMode === 'collect'}
	{@render children?.()}
{/if}
