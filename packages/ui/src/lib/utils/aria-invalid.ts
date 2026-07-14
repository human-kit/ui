import type { HTMLInputAttributes } from 'svelte/elements';

type AriaInvalidValue = HTMLInputAttributes['aria-invalid'];

/** True when an `aria-invalid` value semantically marks the control as invalid. */
export function isAriaInvalidValue(value: AriaInvalidValue | undefined): boolean {
	return value === true || value === 'true' || value === 'grammar' || value === 'spelling';
}
