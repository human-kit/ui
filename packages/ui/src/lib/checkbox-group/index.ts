import type { ComponentProps } from 'svelte';
import type CheckboxIndicatorComponent from '../checkbox/indicator/checkbox-indicator.svelte';
import type CheckboxRootComponent from '../checkbox/root/checkbox-root.svelte';
import type CheckboxGroupLabelComponent from './label/checkbox-group-label.svelte';
import type CheckboxGroupRootComponent from './root/checkbox-group-root.svelte';

export * as CheckboxGroup from './index.parts.js';

export { default as CheckboxGroupRoot } from './root/checkbox-group-root.svelte';
export { default as CheckboxGroupLabel } from './label/checkbox-group-label.svelte';
export type CheckboxGroupRootProps = ComponentProps<typeof CheckboxGroupRootComponent>;
export type CheckboxGroupLabelProps = ComponentProps<typeof CheckboxGroupLabelComponent>;
export type CheckboxGroupItemProps = ComponentProps<typeof CheckboxRootComponent>;
export type CheckboxGroupIndicatorProps = ComponentProps<typeof CheckboxIndicatorComponent>;
export {
	createCheckboxGroupContext,
	getCheckboxGroupContext,
	setCheckboxGroupContext,
	type CheckboxGroupContext,
	type CheckboxGroupOrientation,
	type CheckboxGroupValue,
	type CreateCheckboxGroupContextOptions
} from './root/context.svelte';

import * as CheckboxGroupParts from './index.parts.js';
export default CheckboxGroupParts;
