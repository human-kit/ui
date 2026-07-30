/**
 * Normalizes a string for searching: lower case, and without the diacritics.
 *
 * Decomposing first (`NFD`) splits an accented letter into the letter plus its combining
 * mark, so stripping the marks leaves the plain letter — `Á` becomes `a`. Used by the
 * combobox's default filter, so a list can be searched the way people type.
 */
export function foldForSearch(value: string): string {
	return value
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase();
}
