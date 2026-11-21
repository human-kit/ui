<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { useTreeContext, useTreeSectionContext } from '../root/context.svelte.js';
	import { getTreeRenderMode } from '../root/render-mode.js';
	import type { TreeHeaderProps } from '../types.js';

	let { children, class: className = '', id, ...restProps }: TreeHeaderProps = $props();

	const ctx = useTreeContext();
	const section = useTreeSectionContext();
	const renderMode = getTreeRenderMode();
	const resolvedId = untrack(() => id ?? ctx.createGeneratedId('tree-header'));

	function syncHeaderRegistration() {
		section?.setHeader({
			id: resolvedId,
			render: children,
			className,
			domProps: restProps
		});
	}

	if (renderMode === 'collect') {
		syncHeaderRegistration();
	}

	onDestroy(() => {
		if (section?.getHeaderId() === resolvedId) {
			section.setHeader(undefined);
		}
	});
</script>

<!-- registration only -->
