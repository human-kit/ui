import type { ComponentProps } from 'svelte';
import type ToggleGroupRootComponent from './root/toggle-group-root.svelte';

export * as ToggleGroup from './index.parts.js';

export { default as ToggleGroupRoot } from './root/toggle-group-root.svelte';
export type ToggleGroupRootProps = ComponentProps<typeof ToggleGroupRootComponent>;
export {
	createToggleGroupContext,
	getToggleGroupContext,
	setToggleGroupContext,
	valuesToArray,
	type CreateToggleGroupContextOptions,
	type ToggleGroupContext,
	type ToggleGroupOrientation,
	type ToggleGroupSelectionMode,
	type ToggleGroupValue
} from './root/context.svelte';

import * as ToggleGroupParts from './index.parts.js';
export default ToggleGroupParts;
