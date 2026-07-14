export type NumberFieldStep = number | 'any';

export type NumberParseResult =
	| { kind: 'empty'; value: null }
	| { kind: 'partial'; value: number | null }
	| { kind: 'invalid'; value: null }
	| { kind: 'valid'; value: number };

const bidiControlPattern = /[\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069]/g;
const whitespacePattern = /[\s\u00a0\u202f]/g;

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getRuntimeLocale(): string | undefined {
	if (typeof navigator === 'undefined') return undefined;
	return navigator.language;
}

function createFormatter(
	locale: string | undefined,
	options: Intl.NumberFormatOptions | undefined
) {
	try {
		return new Intl.NumberFormat(locale, options);
	} catch {
		return new Intl.NumberFormat(locale);
	}
}

function createPartsFormatter(locale: string | undefined) {
	return new Intl.NumberFormat(locale, {
		useGrouping: true,
		signDisplay: 'always'
	});
}

function createLiteralPercentFormatterOptions(
	locale: string | undefined,
	options: Intl.NumberFormatOptions | undefined
): Intl.NumberFormatOptions | undefined {
	if (!options || options.style !== 'percent') return options;

	const decimalOptions: Intl.NumberFormatOptions = { ...options };
	delete decimalOptions.style;
	delete decimalOptions.currency;
	delete decimalOptions.currencyDisplay;
	delete decimalOptions.currencySign;
	delete decimalOptions.unit;
	delete decimalOptions.unitDisplay;

	const resolvedPercentOptions = createFormatter(locale, options).resolvedOptions();

	return {
		...decimalOptions,
		minimumFractionDigits:
			decimalOptions.minimumFractionDigits ?? resolvedPercentOptions.minimumFractionDigits,
		maximumFractionDigits:
			decimalOptions.maximumFractionDigits ?? resolvedPercentOptions.maximumFractionDigits
	};
}

function acceptsPercentFractions(
	locale: string | undefined,
	options: Intl.NumberFormatOptions | undefined
): boolean {
	return options?.style === 'percent' && getFormatterMaximumFractionDigits(locale, options) > 0;
}

function getFormatterMaximumFractionDigits(
	locale: string | undefined,
	options: Intl.NumberFormatOptions | undefined
): number {
	const formatterOptions =
		options?.style === 'percent' ? createLiteralPercentFormatterOptions(locale, options) : options;

	return createFormatter(locale, formatterOptions).resolvedOptions().maximumFractionDigits ?? 0;
}

function getLocalizedDigits(locale: string | undefined): Map<string, string> {
	const formatter = new Intl.NumberFormat(locale, { useGrouping: false });
	const digits = new Map<string, string>();

	for (let index = 0; index <= 9; index += 1) {
		digits.set(formatter.format(index), String(index));
	}

	return digits;
}

function getNumberSymbols(locale: string | undefined) {
	const formatter = createPartsFormatter(locale);
	const parts = formatter.formatToParts(-12345.6);

	return {
		decimal: parts.find((part) => part.type === 'decimal')?.value ?? '.',
		group: parts.find((part) => part.type === 'group')?.value ?? ',',
		minusSign: parts.find((part) => part.type === 'minusSign')?.value ?? '-',
		plusSign: formatter.formatToParts(1).find((part) => part.type === 'plusSign')?.value ?? '+',
		percentSign:
			new Intl.NumberFormat(locale, { style: 'percent' })
				.formatToParts(1)
				.find((part) => part.type === 'percentSign')?.value ?? '%'
	};
}

function formatLiteralPercentValue(
	value: number,
	locale: string | undefined,
	formatOptions: Intl.NumberFormatOptions
): string {
	const decimalText = createFormatter(
		locale,
		createLiteralPercentFormatterOptions(locale, formatOptions)
	).format(value);
	const parts = createFormatter(locale, { style: 'percent' }).formatToParts(1);
	let insertedNumber = false;

	return parts
		.map((part) => {
			if (
				part.type === 'integer' ||
				part.type === 'group' ||
				part.type === 'decimal' ||
				part.type === 'fraction'
			) {
				if (insertedNumber) return '';
				insertedNumber = true;
				return decimalText;
			}

			return part.value;
		})
		.join('');
}

function getFormatterLiteralParts(
	locale: string | undefined,
	formatOptions: Intl.NumberFormatOptions | undefined
): string[] {
	const formatter = createFormatter(locale, formatOptions);
	const numericPartTypes = new Set<Intl.NumberFormatPartTypes>([
		'integer',
		'group',
		'decimal',
		'fraction',
		'minusSign',
		'plusSign'
	]);
	const literals = new Set<string>();

	for (const sampleValue of [-12345.6, 12345.6]) {
		for (const part of formatter.formatToParts(sampleValue)) {
			if (numericPartTypes.has(part.type)) continue;
			if (part.value) literals.add(part.value);
		}
	}

	return [...literals];
}

function hasUnsupportedAlphabeticCharacters(
	input: string,
	locale: string | undefined,
	formatOptions: Intl.NumberFormatOptions | undefined
): boolean {
	if (!/\p{L}/u.test(input)) return false;

	let stripped = input;
	for (const literal of getFormatterLiteralParts(locale, formatOptions)) {
		stripped = stripped.split(literal).join('');
	}
	for (const localizedDigit of getLocalizedDigits(locale).keys()) {
		stripped = stripped.split(localizedDigit).join('');
	}

	return /\p{L}/u.test(stripped);
}

function normalizeLocalizedNumber(input: string, locale: string | undefined): string {
	const symbols = getNumberSymbols(locale);
	const digits = getLocalizedDigits(locale);
	let normalized = input.replace(bidiControlPattern, '').trim();

	// Full-width digits (U+FF10–U+FF19), common with Japanese IME input, are valid decimal
	// digits (Unicode Nd) that never appear in the locale digit map — map them to ASCII early.
	normalized = normalized.replace(/[０-９]/g, (digit) =>
		String.fromCharCode(digit.charCodeAt(0) - 0xfee0)
	);

	let isAccountingNegative = false;

	if (normalized.includes('(') && normalized.includes(')')) {
		isAccountingNegative = true;
	}

	normalized = normalized.replace(whitespacePattern, '');

	for (const [localizedDigit, asciiDigit] of digits) {
		normalized = normalized.replace(new RegExp(escapeRegExp(localizedDigit), 'g'), asciiDigit);
	}

	const groupPattern = new RegExp(escapeRegExp(symbols.group), 'g');
	normalized = normalized.replace(groupPattern, '');
	normalized = normalized.replace(new RegExp(escapeRegExp(symbols.decimal), 'g'), '.');
	normalized = normalized.replace(new RegExp(escapeRegExp(symbols.minusSign), 'g'), '-');
	normalized = normalized.replace(new RegExp(escapeRegExp(symbols.plusSign), 'g'), '+');
	normalized = normalized.replace(new RegExp(escapeRegExp(symbols.percentSign), 'g'), '%');

	normalized = normalized.replace(/[^0-9.+\-%]/g, '');
	normalized = normalized.replace(/%/g, '');

	if (isAccountingNegative && !normalized.startsWith('-')) {
		normalized = `-${normalized}`;
	}

	return normalized;
}

function decimalPlaces(value: number): number {
	if (!Number.isFinite(value)) return 0;
	const text = value.toString().toLowerCase();
	if (!text.includes('e')) {
		return text.split('.')[1]?.length ?? 0;
	}

	const [coefficient, exponentText] = text.split('e');
	const exponent = Number(exponentText);
	const coefficientDecimals = coefficient.split('.')[1]?.length ?? 0;
	return Math.max(0, coefficientDecimals - exponent);
}

function roundToPrecision(value: number, precision: number): number {
	const factor = 10 ** Math.min(precision, 12);
	// Round on the absolute value and reapply the sign so ties resolve
	// away from zero symmetrically: 0.025 → 0.03 and -0.025 → -0.03
	// (Math.round alone rounds -0.025 toward +Infinity, giving -0.02).
	const rounded = Math.round((Math.abs(value) + Number.EPSILON) * factor) / factor;
	return value < 0 ? -rounded : rounded;
}

export function roundNumberValueToFormat(
	value: number,
	locale: string | undefined,
	formatOptions: Intl.NumberFormatOptions | undefined
): number {
	if (!Number.isFinite(value)) return value;
	const maximumFractionDigits = getFormatterMaximumFractionDigits(locale, formatOptions);
	return roundToPrecision(value, maximumFractionDigits);
}

export function resolveNumberFieldLocale(locale: string | undefined): string | undefined {
	return locale ?? getRuntimeLocale();
}

export function formatNumberValue(
	value: number | null,
	locale: string | undefined,
	formatOptions: Intl.NumberFormatOptions | undefined
): string {
	if (value === null || !Number.isFinite(value)) return '';
	if (formatOptions?.style === 'percent') {
		return formatLiteralPercentValue(value, locale, formatOptions);
	}
	return createFormatter(locale, formatOptions).format(value);
}

export function parseNumberInput(
	input: string,
	locale: string | undefined,
	formatOptions: Intl.NumberFormatOptions | undefined
): NumberParseResult {
	const trimmed = input.trim();
	if (!trimmed) return { kind: 'empty', value: null };

	if (hasUnsupportedAlphabeticCharacters(trimmed, locale, formatOptions)) {
		return { kind: 'invalid', value: null };
	}

	const normalized = normalizeLocalizedNumber(trimmed, locale);
	let numericText = normalized.replace(/%$/, '');

	if (numericText === '') return { kind: 'invalid', value: null };

	if (/^[+-]$/.test(numericText) || /^[+-]?\.$/.test(numericText)) {
		return { kind: 'partial', value: null };
	}

	if (/^[+-]?\d+\.$/.test(numericText)) {
		return {
			kind: 'partial',
			value: roundNumberValueToFormat(Number(numericText), locale, formatOptions)
		};
	}

	// With percent style and no fraction digits allowed, sub-1 decimals like
	// "0.5" are read as the fractional percent form and become "5" (%). This
	// must not apply to inputs with an integer part ("12.5"): those fall
	// through and get rounded to the formatter's fraction digits instead of
	// being digit-concatenated into "125".
	if (
		formatOptions?.style === 'percent' &&
		!acceptsPercentFractions(locale, formatOptions) &&
		/^[+-]?0?\.\d+$/.test(numericText)
	) {
		numericText = numericText.replace('.', '');
	}

	if (!/^[+-]?(?:\d+|\d+\.\d+|\.\d+)$/.test(numericText)) {
		return { kind: 'invalid', value: null };
	}

	const value = Number(numericText);
	if (!Number.isFinite(value)) return { kind: 'invalid', value: null };

	return {
		kind: 'valid',
		value: roundNumberValueToFormat(value, locale, formatOptions)
	};
}

export function normalizeStep(step: NumberFieldStep | undefined): number {
	if (step === 'any') return 1;
	return Number.isFinite(step) && Number(step) > 0 ? Number(step) : 1;
}

export function clampNumber(
	value: number,
	min: number | undefined,
	max: number | undefined
): number {
	let nextValue = value;
	if (Number.isFinite(min) && min !== undefined) {
		nextValue = Math.max(min, nextValue);
	}
	if (Number.isFinite(max) && max !== undefined) {
		nextValue = Math.min(max, nextValue);
	}
	return nextValue;
}

export function snapNumberToStep(
	value: number,
	step: NumberFieldStep | undefined,
	min: number | undefined
): number {
	if (step === 'any') return value;

	const resolvedStep = normalizeStep(step);
	const base = Number.isFinite(min) && min !== undefined ? min : 0;
	const precision = Math.max(
		decimalPlaces(value),
		decimalPlaces(resolvedStep),
		decimalPlaces(base)
	);
	const snapped = base + Math.round((value - base) / resolvedStep) * resolvedStep;
	return roundToPrecision(snapped, precision);
}

export function getStepBaseValue(
	value: number | null,
	min: number | undefined,
	max: number | undefined
): number {
	if (value !== null && Number.isFinite(value)) return value;
	if (Number.isFinite(min) && min !== undefined) return min;
	if (Number.isFinite(max) && max !== undefined && max < 0) return max;
	return 0;
}

export function stepNumberValue(
	value: number | null,
	direction: -1 | 1,
	options: {
		min: number | undefined;
		max: number | undefined;
		step: NumberFieldStep | undefined;
		multiplier?: number;
		snapOnStep?: boolean;
	}
): number {
	const baseStep = normalizeStep(options.step);
	const resolvedStep = baseStep * (options.multiplier ?? 1);
	const baseValue = getStepBaseValue(value, options.min, options.max);
	const precision = Math.max(
		decimalPlaces(baseValue),
		decimalPlaces(resolvedStep),
		decimalPlaces(options.min ?? 0)
	);
	const nextValue = roundToPrecision(baseValue + resolvedStep * direction, precision);
	const snapStep: NumberFieldStep | undefined =
		options.step !== 'any' && resolvedStep < baseStep ? resolvedStep : options.step;
	const steppedValue = options.snapOnStep
		? snapNumberToStep(nextValue, snapStep, options.min)
		: nextValue;

	return clampNumber(steppedValue, options.min, options.max);
}

export function isValueOutOfRange(
	value: number | null,
	min: number | undefined,
	max: number | undefined
): boolean {
	if (value === null) return false;
	if (Number.isFinite(min) && min !== undefined && value < min) return true;
	if (Number.isFinite(max) && max !== undefined && value > max) return true;
	return false;
}
