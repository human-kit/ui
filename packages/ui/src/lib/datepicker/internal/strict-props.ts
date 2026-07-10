import { sanitizeStrictProps } from '../../internal/strict-props';

export { composeEventHandlers } from '../../internal/strict-props';

export function sanitizeDatePickerProps(
	componentName: string,
	props: Record<string, unknown>,
	forbiddenProps: string[]
): Record<string, unknown> {
	return sanitizeStrictProps('DatePicker', componentName, props, forbiddenProps);
}
