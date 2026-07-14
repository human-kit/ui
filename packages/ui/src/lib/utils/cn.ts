export type ClassValue = ClassValue[] | string | number | boolean | null | undefined;

/**
 * Joins class values into a single string.
 *
 * Dependency-free: the components are headless and ship no default Tailwind
 * classes, so there are no conflicting utilities to resolve (which is why this
 * no longer needs `clsx`/`tailwind-merge`). Accepts strings, numbers and nested
 * arrays; falsy values (including `0`, `NaN` and empty strings) are dropped so
 * `condition && 'class'` works. Objects (clsx-style dictionaries) are
 * intentionally not supported.
 */
export function cn(...inputs: ClassValue[]): string {
	const classes: string[] = [];

	const append = (value: ClassValue) => {
		if (Array.isArray(value)) {
			for (const item of value) append(item);
		} else if ((typeof value === 'string' || typeof value === 'number') && value) {
			classes.push(String(value));
		}
	};

	for (const input of inputs) append(input);

	return classes.join(' ');
}
