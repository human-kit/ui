import { browser } from '$app/environment';

// Shared, cross-instance selection for the package-manager install tabs, so
// switching pnpm → npm in one snippet switches every snippet on the page (and
// remembers the choice). The active manager is a per-user, client-only preference
// that SSR can't know, so the visible command/tab is driven entirely by CSS keyed
// off `<html data-pm>` (see theme.css + install-command.svelte). The anti-FOUC
// script in app.html seeds that attribute before the first paint, and this state
// is seeded from it too, so the copy button + aria stay in sync with what the CSS
// already shows — no post-hydration jump.
export const MANAGERS = ['pnpm', 'npm', 'yarn', 'bun'] as const;
export type PackageManager = (typeof MANAGERS)[number];

const STORAGE_KEY = 'docs:pm';

function isManager(value: string | null | undefined): value is PackageManager {
	return !!value && (MANAGERS as readonly string[]).includes(value);
}

/** The choice the app.html anti-FOUC script already applied to `<html data-pm>`. */
function initial(): PackageManager {
	if (!browser) return 'pnpm';
	const attr = document.documentElement.dataset.pm;
	return isManager(attr) ? attr : 'pnpm';
}

export const pm = $state<{ value: PackageManager }>({ value: initial() });

/**
 * Persist the current preference and mirror it to `<html data-pm>`, so the CSS
 * follows the selection immediately and the next load's anti-FOUC script reads it.
 * Call from an effect (it tracks pm.value).
 */
export function persistPm() {
	if (!browser) return;
	document.documentElement.dataset.pm = pm.value;
	localStorage.setItem(STORAGE_KEY, pm.value);
}
