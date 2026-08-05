type ImportMetaWithEnv = ImportMeta & {
	readonly env?: {
		readonly DEV?: boolean;
	};
};

export const browser = typeof window !== 'undefined' && typeof document !== 'undefined';
export const dev = (import.meta as ImportMetaWithEnv).env?.DEV ?? false;

/**
 * Whether the platform uses Cmd where the rest use Ctrl.
 *
 * Only for *naming* a shortcut — `aria-keyshortcuts`, a hint in the UI. Never gate behaviour
 * on it: handlers should accept `ctrlKey || metaKey` and let either work everywhere, which is
 * both simpler and right for a user on an Apple keyboard plugged into something else.
 *
 * `false` on the server, where there is no platform to read; the value is corrected on
 * hydration, and an attribute that names a key is safe to settle a tick late.
 */
export const isApplePlatform =
	browser &&
	/mac|iphone|ipad|ipod/i.test(
		(navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ??
			navigator.platform ??
			''
	);
