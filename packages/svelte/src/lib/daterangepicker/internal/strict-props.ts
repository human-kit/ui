import { dev } from '../../internal/environment';

const warnedMessages = new Set<string>();

function warnOnce(message: string) {
	if (!dev) return;
	if (warnedMessages.has(message)) return;
	warnedMessages.add(message);
	console.warn(message);
}

export function sanitizeDateRangePickerProps(
	componentName: string,
	props: Record<string, unknown>,
	forbiddenProps: string[]
): Record<string, unknown> {
	if (props === null || typeof props !== 'object') return {};
	const sanitized: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(props)) {
		if (forbiddenProps.includes(key)) {
			warnOnce(
				`[DateRangePicker.${componentName}]: Prop "${key}" is controlled by DateRangePicker.Root and has been ignored.`
			);
			continue;
		}
		sanitized[key] = value;
	}

	return sanitized;
}

export function composeEventHandlers<TEvent extends Event>(
	internalHandler: ((event: TEvent) => void) | undefined,
	externalHandler: ((event: TEvent) => void) | undefined
): (event: TEvent) => void {
	return (event: TEvent) => {
		internalHandler?.(event);
		externalHandler?.(event);
	};
}
