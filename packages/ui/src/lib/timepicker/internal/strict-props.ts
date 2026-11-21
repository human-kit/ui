import { sanitizeStrictProps } from '../../internal/strict-props.js';

export { composeEventHandlers } from '../../internal/strict-props.js';

export function sanitizeTimePickerProps(
	componentName: string,
	props: Record<string, unknown>,
	forbiddenProps: string[]
): Record<string, unknown> {
	return sanitizeStrictProps('TimePicker', componentName, props, forbiddenProps, { cache: true });
}
