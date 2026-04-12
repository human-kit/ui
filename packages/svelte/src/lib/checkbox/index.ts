export * as Checkbox from './index.parts.js';

export { default as CheckboxRoot } from './root/checkbox-root.svelte';
export { default as CheckboxIndicator } from './indicator/checkbox-indicator.svelte';

export {
	getCheckboxContext,
	setCheckboxContext,
	useCheckboxContext,
	type CheckboxContext,
	type CheckboxState
} from './root/context.js';

import * as CheckboxParts from './index.parts.js';
export default CheckboxParts;
