import MenuContent from './content.svelte';
import MenuGroup from './group.svelte';
import MenuGroupLabel from './group-label.svelte';
import MenuItem from './item.svelte';
import MenuRoot from './root.svelte';
import MenuSeparator from './separator.svelte';
import MenuSubmenuRoot from './submenu-root.svelte';
import MenuSubmenuTrigger from './submenu-trigger.svelte';
import MenuTrigger from './trigger.svelte';

export const Menu = Object.assign(MenuRoot, {
	Root: MenuRoot,
	Trigger: MenuTrigger,
	Content: MenuContent,
	Item: MenuItem,
	Separator: MenuSeparator,
	Group: MenuGroup,
	GroupLabel: MenuGroupLabel,
	SubmenuRoot: MenuSubmenuRoot,
	SubmenuTrigger: MenuSubmenuTrigger
});

export {
	MenuContent,
	MenuGroup,
	MenuGroupLabel,
	MenuItem,
	MenuRoot,
	MenuSeparator,
	MenuSubmenuRoot,
	MenuSubmenuTrigger,
	MenuTrigger
};
export { menuRecipe } from './recipe';
