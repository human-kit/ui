<script lang="ts" module>
	export const SELECT_ITEM_CONTEXT_KEY = Symbol.for('select-item');

	export type SelectItemContext = {
		id: string | number;
	};
</script>

<script lang="ts">
	import { setContext, untrack } from 'svelte';
	import ListBoxItem from '../../listbox/item/listbox-item.svelte';
	import { getSelectItemDomId, useSelectContext } from '../root/context';
	import type { ComponentProps } from 'svelte';

	type SelectItemProps = Omit<
		ComponentProps<typeof ListBoxItem>,
		| 'customId'
		| 'disableFocusHandling'
		| 'isFocusedOverride'
		| 'isFocusVisibleOverride'
		| 'onItemSelect'
		| 'onResolvedTextValue'
		| 'onItemHoverStart'
		| 'scrollOnFocus'
		| 'isParentDisabled'
		| 'pressed'
	>;

	/**
	 * Select.Item — one option of the list.
	 *
	 * It is `ListBox.Item` with an id that is unique across selects, and it reports its text to
	 * the root, thus the trigger can show the text of the selection after the popover closes and
	 * the option leaves the DOM.
	 */
	let { id, textValue, ...props }: SelectItemProps = $props();

	const ctx = useSelectContext('Select.Item');

	setContext<SelectItemContext>(SELECT_ITEM_CONTEXT_KEY, {
		get id() {
			return id;
		}
	});

	const domId = $derived(getSelectItemDomId(ctx.instanceId, id));

	$effect(() => {
		const key = id;
		const text = textValue;
		if (text) untrack(() => ctx.registerItemLabel(key, text));
	});

	function handleResolvedTextValue(label: string) {
		ctx.registerItemLabel(id, label);
	}
</script>

<ListBoxItem
	{...props}
	{id}
	{textValue}
	customId={domId}
	scrollOnFocus={true}
	isParentDisabled={ctx.isDisabled}
	onResolvedTextValue={handleResolvedTextValue}
	data-select-item="true"
/>
