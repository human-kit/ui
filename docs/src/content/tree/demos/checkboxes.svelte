<script lang="ts">
	import { Tree } from '@human-kit/ui';
	import Check from '@lucide/svelte/icons/check';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Minus from '@lucide/svelte/icons/minus';

	let selectedKeys = $state<Set<string | number>>(new Set(['weekly']));

	const itemClass =
		'flex w-full items-center gap-2 rounded-md py-1.5 pr-2 text-sm font-medium text-neutral-700 outline-none transition-colors hover:bg-neutral-100 data-focus-visible:outline-2 data-focus-visible:-outline-offset-2 data-focus-visible:outline-neutral-900 data-selected:bg-neutral-900 data-selected:text-white dark:text-neutral-300 dark:hover:bg-neutral-800 dark:data-selected:bg-white dark:data-selected:text-neutral-900 dark:data-focus-visible:outline-white';
	const checkboxClass =
		'group inline-flex size-5 shrink-0 items-center justify-center rounded border border-neutral-300 bg-white text-white transition-colors data-checked:border-neutral-900 data-checked:bg-neutral-900 data-indeterminate:border-neutral-900 data-indeterminate:bg-neutral-900 dark:border-neutral-600 dark:bg-neutral-900 dark:data-checked:border-white dark:data-checked:bg-white dark:data-checked:text-neutral-900 dark:data-indeterminate:border-white dark:data-indeterminate:bg-white dark:data-indeterminate:text-neutral-900';
</script>

{#snippet checkbox(title: string)}
	<Tree.Checkbox aria-label={`Select ${title}`} class={checkboxClass}>
		<Tree.CheckboxIndicator>
			<Check class="size-3.5 group-data-indeterminate:hidden" />
			<Minus class="size-3.5 group-data-checked:hidden" />
		</Tree.CheckboxIndicator>
	</Tree.Checkbox>
{/snippet}

<div class="w-full max-w-sm space-y-3">
	<Tree.Root
		aria-label="Report files"
		selectionMode="multiple"
		selectionPropagation="descendants"
		bind:selectedKeys
		defaultExpandedKeys={['reports']}
		class="space-y-1"
	>
		<Tree.Item id="reports" title="Reports" class={itemClass}>
			<Tree.Trigger
				aria-label="Toggle Reports"
				class="group inline-flex size-6 shrink-0 items-center justify-center rounded text-neutral-500 outline-none transition-colors hover:text-neutral-900 dark:hover:text-neutral-200"
			>
				<ChevronRight class="size-4 transition-transform group-data-expanded:rotate-90" />
			</Tree.Trigger>
			{@render checkbox('Reports')}
			<Tree.Label>Reports</Tree.Label>
			<Tree.Children class="mt-1 space-y-1">
				<Tree.Item id="weekly" title="Weekly report" class={itemClass}>
					{@render checkbox('Weekly report')}
					<Tree.Label>Weekly report</Tree.Label>
				</Tree.Item>
				<Tree.Item id="budget" title="Budget" class={itemClass}>
					{@render checkbox('Budget')}
					<Tree.Label>Budget</Tree.Label>
				</Tree.Item>
			</Tree.Children>
		</Tree.Item>
	</Tree.Root>

	<p class="text-xs text-neutral-500 dark:text-neutral-400">
		selected: {[...selectedKeys].join(', ') || 'none'}
	</p>
</div>
