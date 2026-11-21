import { sanitizeStrictProps } from '../../internal/strict-props.js';

export { composeEventHandlers } from '../../internal/strict-props.js';

export function sanitizeDatePickerProps(
	componentName: string,
	props: Record<string, unknown>,
	forbiddenProps: string[]
): Record<string, unknown> {
	return sanitizeStrictProps('DatePicker', componentName, props, forbiddenProps);
}
