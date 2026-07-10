import { sanitizeStrictProps } from '../../internal/strict-props';

export { composeEventHandlers } from '../../internal/strict-props';

export function sanitizeDateRangePickerProps(
	componentName: string,
	props: Record<string, unknown>,
	forbiddenProps: string[]
): Record<string, unknown> {
	return sanitizeStrictProps('DateRangePicker', componentName, props, forbiddenProps);
}
