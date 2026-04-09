export * as Checkbox from './index.parts.ts';

export { default as CheckboxRoot } from './root/checkbox-root.svelte';
export { default as CheckboxIndicator } from './indicator/checkbox-indicator.svelte';

export {
	getCheckboxContext,
	setCheckboxContext,
	useCheckboxContext,
	type CheckboxContext,
	type CheckboxState
} from './root/context.ts';

import * as CheckboxParts from './index.parts.ts';
export default CheckboxParts;