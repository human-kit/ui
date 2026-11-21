<script lang="ts">
	import { getTreeRenderMode } from '../root/render-mode.js';
	import { useTreeItemBuildContext } from '../item/build-context.js';
	import type { TreeChildrenProps } from '../types.js';

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
