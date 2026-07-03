import { dev } from '../../internal/environment';

const warnedMessages = new Set<string>();
const sanitizeCache = new WeakMap<object, Map<string, Record<string, unknown>>>();

function warnOnce(message: string) {
	if (!dev) return;
	if (warnedMessages.has(message)) return;
	warnedMessages.add(message);
	console.warn(message);
}

export function sanitizeTimePickerProps(
	componentName: string,
	props: Record<string, unknown>,
	forbiddenProps: string[]
): Record<string, unknown> {
	if (props === null || typeof props !== 'object') return {};
	const forbiddenKey = [...forbiddenProps].sort().join('|');
	const cachedByProps = sanitizeCache.get(props);
	const cached = cachedByProps?.get(forbiddenKey);
	if (cached) return cached;

	const sanitized: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(props)) {
		if (forbiddenProps.includes(key)) {
			warnOnce(
				`[TimePicker.${componentName}]: Prop "${key}" is controlled by TimePicker.Root and has been ignored.`
			);
			continue;
		}
		sanitized[key] = value;
	}

	let cacheBucket = cachedByProps;
	if (!cacheBucket) {
		cacheBucket = new Map<string, Record<string, unknown>>();
		sanitizeCache.set(props, cacheBucket);
	}
	cacheBucket.set(forbiddenKey, sanitized);

	return sanitized;
}

export function composeEventHandlers<TEvent extends Event>(
	internalHandler: ((event: TEvent) => void) | undefined,
	externalHandler: ((event: TEvent) => void) | undefined,
	options?: { skipExternalOnDefaultPrevented?: boolean }
): (event: TEvent) => void {
	return (event: TEvent) => {
		let preventDefaultCalled = false;
		const originalPreventDefault = event.preventDefault.bind(event);
		event.preventDefault = () => {
			preventDefaultCalled = true;
			originalPreventDefault();
		};
		internalHandler?.(event);
		event.preventDefault = originalPreventDefault;
		if (
			options?.skipExternalOnDefaultPrevented &&
			(event.defaultPrevented || preventDefaultCalled)
		) {
			return;
		}
		externalHandler?.(event);
	};
}
