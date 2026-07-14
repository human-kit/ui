import type { ComponentProps } from 'svelte';
import type CheckboxIndicatorComponent from './indicator/checkbox-indicator.svelte';
import type CheckboxRootComponent from './root/checkbox-root.svelte';

export * as Checkbox from './index.parts.js';

export { default as CheckboxRoot } from './root/checkbox-root.svelte';
export { default as CheckboxIndicator } from './indicator/checkbox-indicator.svelte';
export type CheckboxRootProps = ComponentProps<typeof CheckboxRootComponent>;
export type CheckboxIndicatorProps = ComponentProps<typeof CheckboxIndicatorComponent>;

export {
	getCheckboxContext,
	setCheckboxContext,
	useCheckboxContext,
	type CheckboxContext,
	type CheckboxState
} from './root/context.js';

import * as CheckboxParts from './index.parts.js';
export default CheckboxParts;
