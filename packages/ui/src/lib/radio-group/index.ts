import type { ComponentProps } from 'svelte';
import type RadioGroupIndicatorComponent from './indicator/radio-group-indicator.svelte';
import type RadioGroupLabelComponent from './label/radio-group-label.svelte';
import type RadioGroupItemComponent from './item/radio-group-item.svelte';
import type RadioGroupRootComponent from './root/radio-group-root.svelte';

export * as RadioGroup from './index.parts.js';

export { default as RadioGroupRoot } from './root/radio-group-root.svelte';
export { default as RadioGroupLabel } from './label/radio-group-label.svelte';
export { default as RadioGroupItem } from './item/radio-group-item.svelte';
export { default as RadioGroupIndicator } from './indicator/radio-group-indicator.svelte';
export type RadioGroupRootProps = ComponentProps<typeof RadioGroupRootComponent>;
export type RadioGroupLabelProps = ComponentProps<typeof RadioGroupLabelComponent>;
export type RadioGroupItemProps = ComponentProps<typeof RadioGroupItemComponent>;
export type RadioGroupIndicatorProps = ComponentProps<typeof RadioGroupIndicatorComponent>;

export {
	createRadioGroupContext,
	getRadioGroupContext,
	setRadioGroupContext,
	useRadioGroupContext,
	type CreateRadioGroupContextOptions,
	type RadioGroupContext,
	type RadioGroupOrientation,
	type RadioGroupValue
} from './root/context.svelte';

export {
	getRadioGroupItemContext,
	setRadioGroupItemContext,
	useRadioGroupItemContext,
	type RadioGroupItemContext,
	type RadioGroupItemState
} from './item/context.js';

import * as RadioGroupParts from './index.parts.js';
export default RadioGroupParts;
