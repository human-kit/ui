/**
 * Returns whether the element is rendered in a right-to-left context.
 *
 * Used to invert physical ArrowLeft/ArrowRight keyboard mappings (and
 * physical inline offsets) so horizontal navigation follows the visual
 * direction under `dir="rtl"`, per the WAI-ARIA APG.
 */
export function isRtl(element: Element | null | undefined): boolean {
	if (!element) return false;
	return getComputedStyle(element).direction === 'rtl';
}
