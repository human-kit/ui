// Shared, cross-instance selection for the package-manager install tabs, so
// switching pnpm → npm in one snippet switches every snippet on the page (and
// remembers the choice). Initialised to 'pnpm' on both server and client to keep
// hydration stable; the stored preference is applied from an effect after mount
// (see install-command.svelte).
export const MANAGERS = ['pnpm', 'npm', 'yarn', 'bun'] as const;
export type PackageManager = (typeof MANAGERS)[number];

const STORAGE_KEY = 'docs:pm';

export const pm = $state<{ value: PackageManager }>({ value: 'pnpm' });

/** Apply the persisted preference (call once, client-side, after hydration). */
export function loadStoredPm() {
	if (typeof localStorage === 'undefined') return;
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored && (MANAGERS as readonly string[]).includes(stored)) {
		pm.value = stored as PackageManager;
	}
}

/** Persist the current preference. */
export function persistPm() {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, pm.value);
}
