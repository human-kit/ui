import type { ComponentProps } from 'svelte';
import type AutocompleteRootComponent from './root/autocomplete.svelte';
import type AutocompleteInputComponent from './input/autocomplete-input.svelte';
import type AutocompleteListComponent from './list/autocomplete-list.svelte';
import type AutocompleteItemComponent from './item/autocomplete-item.svelte';
import type AutocompleteItemIndicatorComponent from './item-indicator/autocomplete-item-indicator.svelte';
import type AutocompleteEmptyComponent from './empty/autocomplete-empty.svelte';
import type AutocompleteStatusComponent from './status/autocomplete-status.svelte';

// Namespace export for composition: <Autocomplete.Root>, <Autocomplete.Input>, etc.
export * as Autocomplete from './index.parts.js';

// Direct named exports for individual imports
export { default as AutocompleteRoot } from './root/autocomplete.svelte';
export { default as AutocompleteInput } from './input/autocomplete-input.svelte';
export { default as AutocompleteList } from './list/autocomplete-list.svelte';
export { default as AutocompleteItem } from './item/autocomplete-item.svelte';
export { default as AutocompleteItemIndicator } from './item-indicator/autocomplete-item-indicator.svelte';
export { default as AutocompleteEmpty } from './empty/autocomplete-empty.svelte';
export { default as AutocompleteStatus } from './status/autocomplete-status.svelte';

export type AutocompleteRootProps = ComponentProps<typeof AutocompleteRootComponent>;
export type AutocompleteInputProps = ComponentProps<typeof AutocompleteInputComponent>;
export type AutocompleteListProps = ComponentProps<typeof AutocompleteListComponent>;
export type AutocompleteItemProps = ComponentProps<typeof AutocompleteItemComponent>;
export type AutocompleteItemIndicatorProps = ComponentProps<typeof AutocompleteItemIndicatorComponent>;
export type AutocompleteEmptyProps = ComponentProps<typeof AutocompleteEmptyComponent>;
export type AutocompleteStatusProps = ComponentProps<typeof AutocompleteStatusComponent>;

// Context and types
export {
	getAutocompleteContext,
	setAutocompleteContext,
	useAutocompleteContext,
	defaultAutocompleteFilter,
	type AutocompleteContext,
	type AutocompleteFilter
} from './root/context.js';

// Default export as namespace object
import * as AutocompleteParts from './index.parts.js';
export default AutocompleteParts;
