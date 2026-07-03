import type { ComponentProps } from 'svelte';
import type NumberFieldDecrementComponent from './decrement/number-field-decrement.svelte';
import type NumberFieldGroupComponent from './group/number-field-group.svelte';
import type NumberFieldIncrementComponent from './increment/number-field-increment.svelte';
import type NumberFieldInputComponent from './input/number-field-input.svelte';
import type NumberFieldRootComponent from './root/number-field-root.svelte';
import type NumberFieldScrubAreaCursorComponent from './scrub-area-cursor/number-field-scrub-area-cursor.svelte';
import type NumberFieldScrubAreaComponent from './scrub-area/number-field-scrub-area.svelte';

export * as NumberField from './index.parts.js';

export { default as NumberFieldRoot } from './root/number-field-root.svelte';
export { default as NumberFieldGroup } from './group/number-field-group.svelte';
export { default as NumberFieldInput } from './input/number-field-input.svelte';
export { default as NumberFieldIncrement } from './increment/number-field-increment.svelte';
export { default as NumberFieldDecrement } from './decrement/number-field-decrement.svelte';
export { default as NumberFieldScrubArea } from './scrub-area/number-field-scrub-area.svelte';
export { default as NumberFieldScrubAreaCursor } from './scrub-area-cursor/number-field-scrub-area-cursor.svelte';
export type NumberFieldRootProps = ComponentProps<typeof NumberFieldRootComponent>;
export type NumberFieldGroupProps = ComponentProps<typeof NumberFieldGroupComponent>;
export type NumberFieldInputProps = ComponentProps<typeof NumberFieldInputComponent>;
export type NumberFieldIncrementProps = ComponentProps<typeof NumberFieldIncrementComponent>;
export type NumberFieldDecrementProps = ComponentProps<typeof NumberFieldDecrementComponent>;
export type NumberFieldScrubAreaProps = ComponentProps<typeof NumberFieldScrubAreaComponent>;
export type NumberFieldScrubAreaCursorProps = ComponentProps<
	typeof NumberFieldScrubAreaCursorComponent
>;

export {
	getNumberFieldContext,
	setNumberFieldContext,
	useNumberFieldContext,
	type NumberFieldChangeReason,
	type NumberFieldContext,
	type NumberFieldInputState,
	type NumberFieldStep
} from './root/context.js';

import * as NumberFieldParts from './index.parts.js';
export default NumberFieldParts;
