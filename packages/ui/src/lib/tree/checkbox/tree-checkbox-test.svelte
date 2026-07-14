<script lang="ts">
	import { untrack } from 'svelte';
	import Tree from '../index';

	let {
		selectionMode = 'multiple',
		selectionPropagation = 'none',
		defaultExpandedKeys = ['documents'],
		defaultSelectedKeys = []
	}: {
		selectionMode?: 'none' | 'single' | 'multiple';
		selectionPropagation?: 'none' | 'descendants';
		defaultExpandedKeys?: Iterable<string | number>;
		defaultSelectedKeys?: Iterable<string | number>;
	} = $props();

	let selectedKeys = $state(untrack(() => new Set(defaultSelectedKeys)));
</script>

<Tree.Root
	aria-label="Files"
	{selectionMode}
	{selectionPropagation}
	{defaultExpandedKeys}
	bind:selectedKeys
>
	<Tree.Item id="documents" title="Documents">
		<Tree.Checkbox aria-label="Select Documents">
			<Tree.CheckboxIndicator>
				<svg aria-hidden="true" viewBox="0 0 16 16">
					<path
						d="M3.75 8.5 6.75 11.5 12.25 5.5"
						fill="none"
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
					/>
				</svg>
			</Tree.CheckboxIndicator>
		</Tree.Checkbox>
		<Tree.Label>Documents</Tree.Label>
		<Tree.Children>
			<Tree.Item id="reports" title="Reports">
				<Tree.Label>Reports</Tree.Label>
			</Tree.Item>
			<Tree.Item id="budget" title="Budget">
				<Tree.Checkbox aria-label="Select Budget">
					<Tree.CheckboxIndicator>
						<svg aria-hidden="true" viewBox="0 0 16 16">
							<path
								d="M3.75 8.5 6.75 11.5 12.25 5.5"
								fill="none"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
							/>
						</svg>
					</Tree.CheckboxIndicator>
				</Tree.Checkbox>
				<Tree.Label>Budget</Tree.Label>
			</Tree.Item>
		</Tree.Children>
	</Tree.Item>
</Tree.Root>

<div data-testid="selected-keys">{JSON.stringify([...selectedKeys])}</div>
