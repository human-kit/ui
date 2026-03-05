<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { useLocaleContextOptional } from '../../locale-provider/context';
	import type { TimePickerOpenChangeDetails, TimePickerOpenChangeReason } from './context';
	import { setTimePickerContext, type TimePickerContext } from './context';
	import { buildWheelOptions } from '../../clock/root/wheel-options';
	import {
		adjustSegmentWithStep,
		buildTimePartsFromDraft,
		buildTimePickerSegments,
		clampToStep,
		createEmptyTimePickerDraft,
		formatTimePickerValue,
		getEditableSegmentOrder,
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
		type TimePickerSegmentType,
		type TimePickerTimeValue
	} from './time-utils';

	type TimePickerRootProps = {
		id?: string;
		value?: TimePickerTimeValue | null;
		defaultValue?: TimePickerTimeValue | null;
		onChange?: (value: TimePickerTimeValue | null) => void;
		minValue?: TimePickerTimeValue;
		maxValue?: TimePickerTimeValue;
		hourCycle?: TimePickerHourCycle;
		granularity?: TimePickerGranularity;
		hourStep?: number;
		minuteStep?: number;
		secondStep?: number;
		isDisabled?: boolean;
		isReadOnly?: boolean;
		isRequired?: boolean;
		open?: boolean;
		defaultOpen?: boolean;
		onOpenChange?: (open: boolean, details: TimePickerOpenChangeDetails) => void;
		children?: Snippet;
		class?: string;
		'aria-label'?: string;
	};

	const generatedInstanceId = $props.id();

	let {
		id,
		value = $bindable(),
		defaultValue,
		onChange,
		minValue,
		maxValue,
		hourCycle,
		granularity = 'minute',
		hourStep = 1,
		minuteStep = 1,
		secondStep = 1,
		isDisabled = false,
		isReadOnly = false,
		isRequired = false,
		open = $bindable(),
		defaultOpen = false,
		onOpenChange,
		children,
		class: className = '',
		'aria-label': ariaLabel
	}: TimePickerRootProps = $props();

	const instanceId = untrack(() => id) ?? generatedInstanceId;
	const localeContext = useLocaleContextOptional();
	const localeStore = localeContext?.locale;
	const localeFromContext = $derived.by(() => {
		if (!localeStore) return undefined;
		return $localeStore;
	});
	const systemLocale = untrack(() => Intl.DateTimeFormat().resolvedOptions().locale);
	const resolvedLocale = $derived(localeFromContext ?? systemLocale);
	const resolvedHourCycle = $derived.by<TimePickerHourCycle>(() => {
		if (hourCycle) return hourCycle;
		const localeCycle = new Intl.DateTimeFormat(resolvedLocale, {
			hour: 'numeric'
		}).resolvedOptions().hourCycle;
		return localeCycle === 'h11' || localeCycle === 'h12' ? 12 : 24;
	});

	let openInternal = $state((() => defaultOpen)());
	let focusVisible = $state(false);
	let focusWithin = $state(false);
	let activeSegment = $state<Exclude<TimePickerSegmentType, 'literal'> | null>(null);
	let triggerRef: HTMLElement | null = $state(null);

	const initialValueProp = untrack(() => value);
	const initialDefaultValue = untrack(() =>
		isValidTimePickerValue(defaultValue) ? defaultValue : null
	);
	const initialPropValue =
		initialValueProp === undefined
			? initialDefaultValue
			: isValidTimePickerValue(initialValueProp)
				? initialValueProp
				: null;
	const initialHourCycle = untrack<TimePickerHourCycle>(() => {
		if (hourCycle) return hourCycle;
		const localeCycle = new Intl.DateTimeFormat(resolvedLocale, {
			hour: 'numeric'
		}).resolvedOptions().hourCycle;
		return localeCycle === 'h11' || localeCycle === 'h12' ? 12 : 24;
	});

	let valueInternal = $state<TimePickerTimeValue | null>(initialPropValue);
	let lastPublishedValue = $state<TimePickerTimeValue | null>(initialPropValue);
	let segmentDraft = $state<TimePickerDraft>(
		initialPropValue
			? toDraftFromTimeValue(initialPropValue, initialHourCycle)
			: createEmptyTimePickerDraft()
	);
	let segmentTypeBuffer = $state<TimePickerDraft>(createEmptyTimePickerDraft());

	const segmentRefs: Record<TimePickerEditableSegmentType, HTMLElement | null> = {
		hour: null,
		minute: null,
		second: null,
		dayPeriod: null
	};

	if (initialValueProp === undefined) {
		value = initialPropValue;
	} else if (initialValueProp !== initialPropValue) {
		value = initialPropValue;
	}

	$effect(() => {
		if (open !== undefined && open !== openInternal) {
			openInternal = open;
		}
	});

	$effect(() => {
		const nextValue = value === undefined ? null : isValidTimePickerValue(value) ? value : null;
		if (nextValue === lastPublishedValue) return;
		publishCommittedValue(nextValue, false);
		segmentDraft = nextValue
			? toDraftFromTimeValue(nextValue, resolvedHourCycle)
			: createEmptyTimePickerDraft();
		segmentTypeBuffer = createEmptyTimePickerDraft();
	});

	const segmentFormatter = $derived.by(
		() =>
			new Intl.DateTimeFormat(resolvedLocale, {
				hour: 'numeric',
				minute: granularity !== 'hour' ? '2-digit' : undefined,
				second: granularity === 'second' ? '2-digit' : undefined,
				hourCycle: resolvedHourCycle === 12 ? 'h12' : 'h23',
				timeZone: 'UTC'
			})
	);

	const segments = $derived.by(() =>
		buildTimePickerSegments({
			locale: resolvedLocale,
			hourCycle: resolvedHourCycle,
			granularity,
			draft: segmentDraft,
			formatter: segmentFormatter
		})
	);
	const segmentOrder = $derived(getEditableSegmentOrder(segments));
	const requiredSegments = $derived(getRequiredSegments(granularity, resolvedHourCycle));

	const normalizedMinValue = $derived(isValidTimePickerValue(minValue) ? minValue : undefined);
	const normalizedMaxValue = $derived(isValidTimePickerValue(maxValue) ? maxValue : undefined);

	const isInvalidDraft = $derived.by(() => {
		const required = requiredSegments;
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
		const bindableValue = value === undefined ? valueInternal : value;
		const normalizedBindableValue = isValidTimePickerValue(bindableValue) ? bindableValue : null;
		const didInternalChange = valueInternal !== nextValue;
		const didBindableChange = normalizedBindableValue !== nextValue;
		if (!didInternalChange && !didBindableChange) return false;

		valueInternal = nextValue;
		lastPublishedValue = nextValue;
		if (didBindableChange) {
			value = nextValue;
		}
		if (emitChange && didInternalChange) {
			onChange?.(nextValue);
		}
		return true;
	}

	function setOpen(
		nextOpen: boolean,
		details?: TimePickerOpenChangeDetails | { reason?: TimePickerOpenChangeReason; event?: Event }
	) {
		if (openInternal === nextOpen) return;
		let canceled = false;
		const resolvedDetails: TimePickerOpenChangeDetails = {
			reason: details?.reason ?? 'imperative-action',
			event: details?.event,
			cancel: () => {
				canceled = true;
			},
			get isCanceled() {
				return canceled;
			}
		};

		onOpenChange?.(nextOpen, resolvedDetails);
		if (resolvedDetails.isCanceled) return;

		openInternal = nextOpen;
		open = nextOpen;
	}

	function setFocusVisible(visible: boolean) {
		if (focusVisible === visible) return;
		focusVisible = visible;
	}

	function setTriggerRef(element: HTMLElement | null) {
		if (triggerRef === element) return;
		triggerRef = element;
	}

	function syncFocusWithin() {
		const root = document.getElementById(instanceId);
		const activeElement = document.activeElement;
		const nextWithin = !!root && !!activeElement && root.contains(activeElement);
		if (!nextWithin && focusVisible) {
			focusVisible = false;
		}
		if (!nextWithin && activeSegment !== null) {
			activeSegment = null;
			segmentTypeBuffer = createEmptyTimePickerDraft();
		}
		if (focusWithin === nextWithin) return;
		focusWithin = nextWithin;
	}

	function setActiveSegment(segment: Exclude<TimePickerSegmentType, 'literal'> | null) {
		if (activeSegment === segment) return;
		activeSegment = segment;
		segmentTypeBuffer = createEmptyTimePickerDraft();
	}

	function getSegmentValue(type: Exclude<TimePickerSegmentType, 'literal'>): string {
		if (type === 'hour') return segmentDraft.hour;
		if (type === 'minute') return segmentDraft.minute;
		if (type === 'second') return segmentDraft.second;
		return segmentDraft.dayPeriod;
	}

	function setSegmentValue(type: Exclude<TimePickerSegmentType, 'literal'>, nextValue: string) {
		if (isDisabled || isReadOnly) return;
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
						normalized = String(clampToStep(numeric, Math.max(1, hourStep), 1, 12));
					} else {
						normalized = String(clampToStep(numeric, Math.max(1, hourStep), 0, 23));
					}
				}
				if (type === 'minute') {
					normalized = String(clampToStep(numeric, Math.max(1, minuteStep), 0, 59));
				}
				if (type === 'second') {
					normalized = String(clampToStep(numeric, Math.max(1, secondStep), 0, 59));
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

	function openPopover(reason: TimePickerOpenChangeReason = 'imperative-action', event?: Event) {
		if (isDisabled || isReadOnly) return;
		setOpen(true, { reason, event });
	}

	function closePopover(reason: TimePickerOpenChangeReason = 'imperative-action', event?: Event) {
		setOpen(false, { reason, event });
	}

	function togglePopover(reason: TimePickerOpenChangeReason = 'trigger-press', event?: Event) {
		if (isDisabled || isReadOnly) return;
		setOpen(!openInternal, { reason, event });
	}

	function getTypingThreshold(
		type: Exclude<TimePickerSegmentType, 'literal' | 'dayPeriod'>
	): number {
		if (type === 'hour') {
			return resolvedHourCycle === 12 ? 2 : 3;
		}
		return 6;
	}

	function typeSegmentDigit(
		type: Exclude<TimePickerSegmentType, 'literal'>,
		digit: string
	): boolean {
		if (isDisabled || isReadOnly) return false;
		if (!/^\d$/.test(digit)) return false;
		if (type === 'dayPeriod') return false;

		const currentBuffer = (segmentTypeBuffer[type] || '').slice(0, 2);
		const seededBuffer = currentBuffer.length >= 2 ? '' : currentBuffer;
		let candidate = `${seededBuffer}${digit}`.slice(0, 2);
		if (!candidate) return false;

		const threshold = getTypingThreshold(type);
		if (candidate.length === 1) {
			setSegmentValue(type, candidate);
			segmentTypeBuffer[type] = candidate;
			const numeric = Number(candidate);
			if (Number.isFinite(numeric) && numeric >= threshold) {
				segmentTypeBuffer[type] = '';
				return true;
			}
			return false;
		}

		const numericCandidate = Number(candidate);
		if (!Number.isFinite(numericCandidate)) {
			segmentTypeBuffer[type] = '';
			return false;
		}

		let min = 0;
		let max = 59;
		if (type === 'hour') {
			min = resolvedHourCycle === 12 ? 1 : 0;
			max = resolvedHourCycle === 12 ? 12 : 23;
		}

		if (numericCandidate < min || numericCandidate > max) {
			candidate = digit;
			setSegmentValue(type, candidate);
			segmentTypeBuffer[type] = candidate;
			const fallbackNumeric = Number(candidate);
			if (fallbackNumeric >= threshold) {
				segmentTypeBuffer[type] = '';
				return true;
			}
			return false;
		}

		setSegmentValue(type, candidate);
		segmentTypeBuffer[type] = '';
		return true;
	}

	function adjustSegmentValue(type: Exclude<TimePickerSegmentType, 'literal'>, step: number) {
		if (isDisabled || isReadOnly) return;
		if (type === 'dayPeriod') {
			segmentDraft.dayPeriod = segmentDraft.dayPeriod === 'PM' ? 'AM' : 'PM';
			commitFromDraft();
			return;
		}

		const current = getSegmentValue(type);
		const next = adjustSegmentWithStep(current, type, step, {
			hourCycle: resolvedHourCycle,
			hourStep,
			minuteStep,
			secondStep
		});

		setSegmentValue(type, next);
	}

	function registerSegmentRef(type: TimePickerEditableSegmentType, element: HTMLElement | null) {
		segmentRefs[type] = element;
	}

	function focusNextSegment(type: TimePickerEditableSegmentType): boolean {
		const index = segmentOrder.indexOf(type);
		if (index < 0) return false;
		for (let cursor = index + 1; cursor < segmentOrder.length; cursor += 1) {
			const nextType = segmentOrder[cursor];
			const nextRef = segmentRefs[nextType];
			if (!nextRef || !nextRef.isConnected) continue;
			nextRef.focus();
			return true;
		}
		return false;
	}

	function focusPreviousSegment(type: TimePickerEditableSegmentType): boolean {
		const index = segmentOrder.indexOf(type);
		if (index <= 0) return false;
		for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
			const prevType = segmentOrder[cursor];
			const prevRef = segmentRefs[prevType];
			if (!prevRef || !prevRef.isConnected) continue;
			prevRef.focus();
			return true;
		}
		return false;
	}

	function focusLastSegment(): boolean {
		for (let cursor = segmentOrder.length - 1; cursor >= 0; cursor -= 1) {
			const segmentType = segmentOrder[cursor];
			const ref = segmentRefs[segmentType];
			if (!ref || !ref.isConnected) continue;
			ref.focus();
			return true;
		}
		return false;
	}

	function focusNextPlaceholderOrLastSegment(): boolean {
		for (const segmentType of segmentOrder) {
			const ref = segmentRefs[segmentType];
			if (!ref || !ref.isConnected) continue;
			const currentValue = getSegmentValue(segmentType);
			if (isSegmentValueEmpty(currentValue)) {
				ref.focus();
				return true;
			}
		}
		return focusLastSegment();
	}

	function setValue(nextValue: TimePickerTimeValue | null) {
		if (isDisabled || isReadOnly) return;
		if (nextValue !== null && !isValidTimePickerValue(nextValue)) return;
		if (
			nextValue &&
			isTimeOutOfRange(nextValue, normalizedMinValue, normalizedMaxValue, granularity)
		)
			return;

		publishCommittedValue(nextValue, true);
		segmentDraft = nextValue
			? toDraftFromTimeValue(nextValue, resolvedHourCycle)
			: createEmptyTimePickerDraft();
		segmentTypeBuffer = createEmptyTimePickerDraft();
	}

	function getSegmentLabelByType(type: TimePickerEditableSegmentType): string {
		return getSegmentLabel(type, resolvedLocale);
	}

	function selectWheelValue(type: TimePickerEditableSegmentType, optionValue: string) {
		if (isDisabled || isReadOnly) return;

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

	function getWheelOptions(type: TimePickerEditableSegmentType) {
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
			hourStep,
			minuteStep,
			secondStep,
			hasRangeBounds,
			getCandidateFromPartial,
			isOutOfRange: (candidate) =>
				isTimeOutOfRange(candidate, normalizedMinValue, normalizedMaxValue, granularity)
		});
	}

	const context: TimePickerContext = {
		get id() {
			return instanceId;
		},
		get isDisabled() {
			return isDisabled;
		},
		get isReadOnly() {
			return isReadOnly;
		},
		get isRequired() {
			return isRequired;
		},
		get granularity() {
			return granularity;
		},
		get hourCycle() {
			return resolvedHourCycle;
		},
		get open() {
			return openInternal;
		},
		get focusVisible() {
			return focusVisible;
		},
		get focusWithin() {
			return focusWithin;
		},
		get isInvalidDraft() {
			return isInvalidDraft;
		},
		get value() {
			return valueInternal;
		},
		get locale() {
			return resolvedLocale;
		},
		get triggerRef() {
			return triggerRef;
		},
		get activeSegment() {
			return activeSegment;
		},
		setTriggerRef,
		setFocusVisible,
		syncFocusWithin,
		setActiveSegment,
		openPopover,
		closePopover,
		togglePopover,
		onOpenChange: setOpen,
		setValue,
		getSegments: () => segments,
		getSegmentValue,
		setSegmentValue,
		typeSegmentDigit,
		adjustSegmentValue,
		getSegmentLabel: getSegmentLabelByType,
		registerSegmentRef,
		focusNextPlaceholderOrLastSegment,
		focusNextSegment,
		focusPreviousSegment,
		focusLastSegment,
		selectWheelValue,
		getSelectedWheelValue,
		getWheelOptions
	};

	setTimePickerContext(context);
</script>

<div id={instanceId} class={className} aria-label={ariaLabel}>
	{#if children}
		{@render children()}
	{/if}
</div>
