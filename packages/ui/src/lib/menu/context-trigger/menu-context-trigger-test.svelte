<script lang="ts">
	import { Menu } from '../index';
	import type { MenuOpenChangeDetails } from '../root/context';

	type Props = {
		disabled?: boolean;
		longPress?: boolean;
		longPressDelay?: number;
		withSubmenu?: boolean;
		onAction?: (value: string) => void;
		onOpenChange?: (open: boolean, details: MenuOpenChangeDetails) => void;
	};

	let {
		disabled = false,
		longPress = true,
		longPressDelay,
		withSubmenu = false,
		onAction,
		onOpenChange
	}: Props = $props();
</script>

<Menu.Root {onOpenChange}>
	<Menu.ContextTrigger
		{disabled}
		{longPress}
		{longPressDelay}
		style="width: 200px; height: 120px; margin: 24px;"
	>
		Right click here
	</Menu.ContextTrigger>
	<Menu.Content>
		<Menu.Item value="edit" onAction={() => onAction?.('edit')}>Edit</Menu.Item>
		<Menu.Item value="duplicate" onAction={() => onAction?.('duplicate')}>Duplicate</Menu.Item>

		{#if withSubmenu}
			<Menu.SubmenuRoot>
				<Menu.SubmenuTrigger value="more">More actions</Menu.SubmenuTrigger>
				<Menu.Content>
					<Menu.Item value="archive" onAction={() => onAction?.('archive')}>Archive</Menu.Item>
				</Menu.Content>
			</Menu.SubmenuRoot>
		{/if}
	</Menu.Content>
</Menu.Root>

<!-- Somewhere outside the surface to click, and a second focus target. -->
<button type="button">Outside</button>
