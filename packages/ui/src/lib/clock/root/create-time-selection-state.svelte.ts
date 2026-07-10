import { untrack } from 'svelte';
import { fromStore } from 'svelte/store';
import { useLocaleContextOptional } from '../../locale-provider/context';
import { buildWheelOptions } from './wheel-options';
import {
	buildTimePartsFromDraft,
	clampToStep,
	createEmptyTimePickerDraft,
	formatTimePickerValue,
	getRequiredSegments,
	getSegmentLabel,
	isSegmentValueEmpty,
	isTimeOutOfRange,
	isValidTimePickerValue,
	normalizeSegmentNumberInput,
	toDraftFromTimeValue,
	type TimePickerDraft,
	type TimePickerEditableSegmentType,
	type TimePickerGranularity,
	type TimePickerHourCycle,
	type TimePickerTimeValue
} from './time-utils';

export type TimeSelectionWheelOption = {
	value: string;
	label: string;
	disabled: boolean;
};

export type TimeSelectionStateOptions = {
	/** Reactive getter for the bindable `value` prop (`undefined` when uncontrolled). */
	value: () => TimePickerTimeValue | null | undefined;
	/** Getter for the `defaultValue` prop. Read once, untracked, during initialization. */
	defaultValue: () => TimePickerTimeValue | null | undefined;
	/** Writes the committed value back to the bindable `value` prop. */
	writeValue: (next: TimePickerTimeValue | null) => void;
	/** `onChange` callback invoked when the committed value changes through interaction. */
	onChange: (next: TimePickerTimeValue | null) => void;
	/** Reactive getter for the `minValue` prop. */
	minValue: () => TimePickerTimeValue | undefined;
	/** Reactive getter for the `maxValue` prop. */
	maxValue: () => TimePickerTimeValue | undefined;
	/** Reactive getter for the `hourCycle` prop; `undefined` resolves from the locale. */
	hourCycle: () => TimePickerHourCycle | undefined;
	/** Reactive getter for the `granularity` prop. */
	granularity: () => TimePickerGranularity;
	/** Reactive getter for the `hourStep` prop. */
	hourStep: () => number;
	/** Reactive getter for the `minuteStep` prop. */
	minuteStep: () => number;
	/** Reactive getter for the `secondStep` prop. */
	secondStep: () => number;
	/**
	 * Whether user-driven mutations are currently allowed.
	 * Clock passes `!disabled`; TimePicker passes `!disabled && !readonly`.
	 */
	isEditable: () => boolean;
	/**
	 * Called right before a single segment is mutated via `setSegmentValue`.
	 * TimePicker uses it to invalidate the pending multi-digit typing buffer for
	 * that segment (`typeSegmentDigit` re-seeds it explicitly afterwards).
	 */
	onBeforeSegmentMutation?: (type: TimePickerEditableSegmentType) => void;
	/**
	 * Called whenever the whole draft is replaced (external value sync,
	 * hourCycle-change rebuild, or imperative `setValue`). TimePicker uses it to
	 * clear its multi-digit typing buffer.
	 */
	onDraftReplaced?: () => void;
};

export type TimeSelectionState = {
	/** Resolved locale (LocaleProvider context, falling back to the system locale). */
	readonly locale: string;
	/** Resolved hour cycle (explicit prop, falling back to the locale's cycle). */
	readonly hourCycle: TimePickerHourCycle;
	/** The committed value (`null` while the draft is empty or not committeable). */
	readonly value: TimePickerTimeValue | null;
	/** The current segment draft (reactive object; owned by this state). */
	readonly draft: TimePickerDraft;
	/**
	 * `true` when the draft has at least one filled segment but cannot be
	 * committed (incomplete, malformed, or out of the min/max range).
	 */
	readonly isInvalidDraft: boolean;
	getSegmentValue: (type: TimePickerEditableSegmentType) => string;
	setSegmentValue: (type: TimePickerEditableSegmentType, nextValue: string) => void;
	/** Re-commits the current draft (publishes `null` when it is not committeable). */
	commitDraft: () => void;
	/**
	 * Imperative setter: ignores invalid or out-of-range values, otherwise
	 * commits, rebuilds the draft, and emits `onChange`.
	 */
	setValue: (nextValue: TimePickerTimeValue | null) => void;
	selectWheelValue: (type: TimePickerEditableSegmentType, optionValue: string) => void;
	getSelectedWheelValue: (type: TimePickerEditableSegmentType) => string | null;
	getWheelOptions: (type: TimePickerEditableSegmentType) => TimeSelectionWheelOption[];
	getSegmentLabel: (type: TimePickerEditableSegmentType) => string;
};

/**
 * Shared time-selection state used by both `Clock.Root` and `TimePicker.Root`.
 *
 * Owns the committed value (controlled/uncontrolled with bindable write-back),
 * the segment draft, the external value -> draft sync (including the rebuild
 * when the resolved hour cycle changes), min/max-aware wheel options, and the
 * locale/hourCycle resolution. Must be called during component initialization
 * (it reads the locale context and creates an effect).
 *
 * Behavioral notes and deliberate per-component differences:
 *
 * - Range policy (shared): a value is never committed while out of the
 *   `minValue`/`maxValue` range. Draft commits publish `null` when the
 *   candidate is out of range; the imperative `setValue` ignores out-of-range
 *   values entirely (TimePicker's historical policy, now applied to both); and
 *   externally provided values (controlled `value` prop or `defaultValue`) are
 *   normalized to `null` when malformed or out of range before being adopted.
 * - `isEditable` differs: TimePicker also blocks mutations while `readonly`;
 *   Clock has no readonly concept and only checks `disabled`.
 * - TimePicker layers a multi-digit typing buffer on top of this state via the
 *   `onBeforeSegmentMutation`/`onDraftReplaced` hooks; Clock does not use them.
 */
export function createTimeSelectionState(options: TimeSelectionStateOptions): TimeSelectionState {
	const localeContext = useLocaleContextOptional();
	const localeStore = localeContext?.locale;
	const localeFromContext = localeStore ? fromStore(localeStore) : undefined;
	const systemLocale = untrack(() => Intl.DateTimeFormat().resolvedOptions().locale);
	const resolvedLocale = $derived(localeFromContext?.current ?? systemLocale);
	const resolvedHourCycle = $derived.by<TimePickerHourCycle>(() => {
		const explicitCycle = options.hourCycle();
		if (explicitCycle) return explicitCycle;
		const localeCycle = new Intl.DateTimeFormat(resolvedLocale, {
			hour: 'numeric'
		}).resolvedOptions().hourCycle;
		return localeCycle === 'h11' || localeCycle === 'h12' ? 12 : 24;
	});

	const normalizedMinValue = $derived.by(() => {
		const minValue = options.minValue();
		return isValidTimePickerValue(minValue) ? minValue : undefined;
	});
	const normalizedMaxValue = $derived.by(() => {
		const maxValue = options.maxValue();
		return isValidTimePickerValue(maxValue) ? maxValue : undefined;
	});

	/**
	 * Normalizes an externally provided value (controlled prop / defaultValue):
	 * malformed or out-of-range values become `null` so they are never adopted
	 * as the committed value.
	 */
	function normalizeExternalValue(raw: unknown): TimePickerTimeValue | null {
		if (!isValidTimePickerValue(raw)) return null;
		if (isTimeOutOfRange(raw, normalizedMinValue, normalizedMaxValue, options.granularity())) {
			return null;
		}
		return raw;
	}

	const initialValueProp = untrack(() => options.value());
	const initialPropValue = untrack(() =>
		initialValueProp === undefined
			? normalizeExternalValue(options.defaultValue())
			: normalizeExternalValue(initialValueProp)
	);
	const initialHourCycle = untrack(() => resolvedHourCycle);

	let valueInternal = $state<TimePickerTimeValue | null>(initialPropValue);
	let lastPublishedValue = $state<TimePickerTimeValue | null>(initialPropValue);
	let segmentDraft = $state<TimePickerDraft>(
		initialPropValue
			? toDraftFromTimeValue(initialPropValue, initialHourCycle)
			: createEmptyTimePickerDraft()
	);
	let lastDraftHourCycle = initialHourCycle;

	if (initialValueProp === undefined || initialValueProp !== initialPropValue) {
		options.writeValue(initialPropValue);
	}

	$effect(() => {
		const nextValue = normalizeExternalValue(options.value());
		const nextHourCycle = resolvedHourCycle;
		const didHourCycleChange = nextHourCycle !== lastDraftHourCycle;
		lastDraftHourCycle = nextHourCycle;
		if (nextValue === lastPublishedValue) {
			if (didHourCycleChange && lastPublishedValue) {
				segmentDraft = toDraftFromTimeValue(lastPublishedValue, nextHourCycle);
				options.onDraftReplaced?.();
			}
			return;
		}
		publishCommittedValue(nextValue, false);
		segmentDraft = nextValue
			? toDraftFromTimeValue(nextValue, nextHourCycle)
			: createEmptyTimePickerDraft();
		options.onDraftReplaced?.();
	});

	const isInvalidDraft = $derived.by(() => {
		const granularity = options.granularity();
		const required = getRequiredSegments(granularity, resolvedHourCycle);
		const hasAnyValue = required.some((type) => !isSegmentValueEmpty(getSegmentValue(type)));
		if (!hasAnyValue) return false;
		const parts = buildTimePartsFromDraft(segmentDraft, granularity, resolvedHourCycle);
		if (!parts) return true;
		const candidate = formatTimePickerValue(parts, granularity);
		return isTimeOutOfRange(candidate, normalizedMinValue, normalizedMaxValue, granularity);
	});

	function publishCommittedValue(
		nextValue: TimePickerTimeValue | null,
		emitChange: boolean
	): boolean {
		const valueProp = options.value();
		const bindableValue = valueProp === undefined ? valueInternal : valueProp;
		const normalizedBindableValue = isValidTimePickerValue(bindableValue) ? bindableValue : null;
		const didInternalChange = valueInternal !== nextValue;
		const didBindableChange = normalizedBindableValue !== nextValue;
		if (!didInternalChange && !didBindableChange) return false;

		valueInternal = nextValue;
		lastPublishedValue = nextValue;
		if (didBindableChange) {
			options.writeValue(nextValue);
		}
		if (emitChange && didInternalChange) {
			options.onChange(nextValue);
		}
		return true;
	}

	function getSegmentValue(type: TimePickerEditableSegmentType): string {
		if (type === 'hour') return segmentDraft.hour;
		if (type === 'minute') return segmentDraft.minute;
		if (type === 'second') return segmentDraft.second;
		return segmentDraft.dayPeriod;
	}

	function setSegmentValue(type: TimePickerEditableSegmentType, nextValue: string) {
		if (!options.isEditable()) return;
		options.onBeforeSegmentMutation?.(type);
		if (type === 'dayPeriod') {
			const normalized = nextValue.trim().toUpperCase();
			if (normalized === '' || normalized === 'AM' || normalized === 'PM') {
				segmentDraft.dayPeriod = normalized;
			} else {
				segmentDraft.dayPeriod = '';
			}
		} else {
			const maxDigits = 2;
			let normalized = normalizeSegmentNumberInput(nextValue, maxDigits);
			if (normalized.length > 0) {
				const numeric = Number(normalized);
				if (type === 'hour') {
					if (resolvedHourCycle === 12) {
						normalized = String(clampToStep(numeric, Math.max(1, options.hourStep()), 1, 12));
					} else {
						normalized = String(clampToStep(numeric, Math.max(1, options.hourStep()), 0, 23));
					}
				}
				if (type === 'minute') {
					normalized = String(clampToStep(numeric, Math.max(1, options.minuteStep()), 0, 59));
				}
				if (type === 'second') {
					normalized = String(clampToStep(numeric, Math.max(1, options.secondStep()), 0, 59));
				}
			}

			if (type === 'hour') segmentDraft.hour = normalized;
			if (type === 'minute') segmentDraft.minute = normalized;
			if (type === 'second') segmentDraft.second = normalized;

			if (resolvedHourCycle === 12 && isSegmentValueEmpty(segmentDraft.dayPeriod)) {
				segmentDraft.dayPeriod = 'AM';
			}
		}

		commitFromDraft();
	}

	function commitFromDraft() {
		const granularity = options.granularity();
		const nextParts = buildTimePartsFromDraft(segmentDraft, granularity, resolvedHourCycle);
		if (!nextParts) {
			publishCommittedValue(null, true);
			return;
		}

		const candidateValue = formatTimePickerValue(nextParts, granularity);
		if (isTimeOutOfRange(candidateValue, normalizedMinValue, normalizedMaxValue, granularity)) {
			publishCommittedValue(null, true);
			return;
		}

		publishCommittedValue(candidateValue, true);
	}

	function setValue(nextValue: TimePickerTimeValue | null) {
		if (!options.isEditable()) return;
		if (nextValue !== null && !isValidTimePickerValue(nextValue)) return;
		if (
			nextValue &&
			isTimeOutOfRange(nextValue, normalizedMinValue, normalizedMaxValue, options.granularity())
		) {
			return;
		}

		publishCommittedValue(nextValue, true);
		segmentDraft = nextValue
			? toDraftFromTimeValue(nextValue, resolvedHourCycle)
			: createEmptyTimePickerDraft();
		options.onDraftReplaced?.();
	}

	function selectWheelValue(type: TimePickerEditableSegmentType, optionValue: string) {
		if (!options.isEditable()) return;

		if (type === 'dayPeriod') {
			setSegmentValue(type, optionValue.toUpperCase());
		} else {
			setSegmentValue(type, optionValue);
		}
	}

	function getSelectedWheelValue(type: TimePickerEditableSegmentType): string | null {
		const selected = getSegmentValue(type);
		return selected.trim().length > 0 ? selected : null;
	}

	function getWheelOptions(type: TimePickerEditableSegmentType): TimeSelectionWheelOption[] {
		const granularity = options.granularity();
		const hasRangeBounds = normalizedMinValue !== undefined || normalizedMaxValue !== undefined;

		const getCandidateFromPartial = (
			partial: Partial<TimePickerDraft>
		): TimePickerTimeValue | null => {
			const candidateDraft: TimePickerDraft = {
				hour: partial.hour ?? segmentDraft.hour,
				minute: partial.minute ?? segmentDraft.minute,
				second: partial.second ?? segmentDraft.second,
				dayPeriod: partial.dayPeriod ?? segmentDraft.dayPeriod
			};
			const parts = buildTimePartsFromDraft(candidateDraft, granularity, resolvedHourCycle);
			if (!parts) return null;
			return formatTimePickerValue(parts, granularity);
		};

		return buildWheelOptions({
			type,
			granularity,
			hourCycle: resolvedHourCycle,
			hourStep: options.hourStep(),
			minuteStep: options.minuteStep(),
			secondStep: options.secondStep(),
			hasRangeBounds,
			getCandidateFromPartial,
			isOutOfRange: (candidate) =>
				isTimeOutOfRange(candidate, normalizedMinValue, normalizedMaxValue, granularity),
			locale: resolvedLocale
		});
	}

	function getSegmentLabelByType(type: TimePickerEditableSegmentType): string {
		return getSegmentLabel(type, resolvedLocale);
	}

	return {
		get locale() {
			return resolvedLocale;
		},
		get hourCycle() {
			return resolvedHourCycle;
		},
		get value() {
			return valueInternal;
		},
		get draft() {
			return segmentDraft;
		},
		get isInvalidDraft() {
			return isInvalidDraft;
		},
		getSegmentValue,
		setSegmentValue,
		commitDraft: commitFromDraft,
		setValue,
		selectWheelValue,
		getSelectedWheelValue,
		getWheelOptions,
		getSegmentLabel: getSegmentLabelByType
	};
}
