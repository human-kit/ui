import { dev } from './environment';

export { composeEventHandlers } from '../utils/compose-event-handlers';

const warnedMessages = new Set<string>();
const sanitizeCache = new WeakMap<object, Map<string, Record<string, unknown>>>();

function warnOnce(message: string) {
	if (!dev) return;
	if (warnedMessages.has(message)) return;
	warnedMessages.add(message);
	console.warn(message);
}

/**
 * Strips props that are controlled by `<rootName>.Root` from a rest-props
 * object, warning once (dev only) for each ignored prop.
 *
 * `cache` memoizes the sanitized object per props-object identity (WeakMap),
 * so repeated calls with the same props object return the same reference.
 * Only enable it where that identity-stability is the expected behavior.
 */
export function sanitizeStrictProps(
	rootName: string,
	componentName: string,
	props: Record<string, unknown>,
	forbiddenProps: string[],
	options?: { cache?: boolean }
): Record<string, unknown> {
	if (props === null || typeof props !== 'object') return {};

	const cacheKey = `${rootName}|${[...forbiddenProps].sort().join('|')}`;
	if (options?.cache) {
		const cached = sanitizeCache.get(props)?.get(cacheKey);
		if (cached) return cached;
	}

	const sanitized: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(props)) {
		if (forbiddenProps.includes(key)) {
			warnOnce(
				`[${rootName}.${componentName}]: Prop "${key}" is controlled by ${rootName}.Root and has been ignored.`
			);
			continue;
		}
		sanitized[key] = value;
	}

	if (options?.cache) {
		let cacheBucket = sanitizeCache.get(props);
		if (!cacheBucket) {
			cacheBucket = new Map<string, Record<string, unknown>>();
			sanitizeCache.set(props, cacheBucket);
		}
		cacheBucket.set(cacheKey, sanitized);
	}

	return sanitized;
}
