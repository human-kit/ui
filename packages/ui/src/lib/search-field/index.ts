import type { ComponentProps } from 'svelte';
import type SearchFieldClearComponent from './clear/search-field-clear.svelte';
import type SearchFieldInputComponent from './input/search-field-input.svelte';
import type SearchFieldLabelComponent from './label/search-field-label.svelte';
import type SearchFieldRootComponent from './root/search-field-root.svelte';

export * as SearchField from './index.parts.js';

export { default as SearchFieldRoot } from './root/search-field-root.svelte';
export { default as SearchFieldLabel } from './label/search-field-label.svelte';
export { default as SearchFieldInput } from './input/search-field-input.svelte';
export { default as SearchFieldClear } from './clear/search-field-clear.svelte';
export type SearchFieldRootProps = ComponentProps<typeof SearchFieldRootComponent>;
export type SearchFieldLabelProps = ComponentProps<typeof SearchFieldLabelComponent>;
export type SearchFieldInputProps = ComponentProps<typeof SearchFieldInputComponent>;
export type SearchFieldClearProps = ComponentProps<typeof SearchFieldClearComponent>;

export {
	getSearchFieldContext,
	setSearchFieldContext,
	useSearchFieldContext,
	type SearchFieldChangeReason,
	type SearchFieldContext
} from './root/context.js';
