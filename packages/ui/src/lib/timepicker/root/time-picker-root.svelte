<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import type { TimePickerOpenChangeDetails, TimePickerOpenChangeReason } from './context';
	import { setTimePickerContext, type TimePickerContext } from './context';
	import { createTimeSelectionState } from '../../clock/root/create-time-selection-state.svelte';
	import {
		adjustSegmentWithStep,
		buildTimePickerSegments,
		createEmptyTimePickerDraft,
		getEditableSegmentOrder,
		isSegmentValueEmpty,
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
		controlledValue?: boolean;
		onChange?: (value: TimePickerTimeValue | null) => void;
		minValue?: TimePickerTimeValue;
		maxValue?: TimePickerTimeValue;
		hourCycle?: TimePickerHourCycle;
		granularity?: TimePickerGranularity;
		hourStep?: number;
		minuteStep?: number;
		secondStep?: number;
		disabled?: boolean;
		readonly?: boolean;
		required?: boolean;
		open?: boolean;
		defaultOpen?: boolean;
		controlledOpen?: boolean;
		onOpenChange?: (open: boolean, details: TimePickerOpenChangeDetails) => void;
		children?: Snippet;
		class?: string;
		element?: HTMLDivElement | null;
		'aria-label'?: string;
	};

	const generatedInstanceId = $props.id();

	let {
		id,
		value = $bindable(),
		defaultValue,
		controlledValue = false,
		onChange,
		minValue,
		maxValue,
		hourCycle,
		granularity = 'minute',
		hourStep = 1,
		minuteStep = 1,
		secondStep = 1,
		disabled = false,
		readonly = false,
		required = false,
		open = $bindable(),
		defaultOpen = false,
		controlledOpen = false,
		onOpenChange,
		children,
		class: className = '',
		element = $bindable<HTMLDivElement | null>(null),
		'aria-label': ariaLabel
	}: TimePickerRootProps = $props();

	let rootRef: HTMLDivElement | null = $state(null);

	$effect(() => {
		element = rootRef;
	});

	const instanceId = untrack(() => id) ?? generatedInstanceId;

	let openInternal = $state((() => defaultOpen)());
	let focusVisible = $state(false);
	let focusWithin = $state(false);
	let activeSegment = $state<Exclude<TimePickerSegmentType, 'literal'> | null>(null);
	let triggerRef: HTMLElement | null = $state(null);
	let segmentTypeBuffer = $state<TimePickerDraft>(createEmptyTimePickerDraft());

	const segmentRefs: Record<TimePickerEditableSegmentType, HTMLElement | null> = {
		hour: null,
		minute: null,
		second: null,
		dayPeriod: null
	};

	const timeSelection = createTimeSelectionState({
		value: () => value,
		defaultValue: () => defaultValue,
		writeValue: (next) => {
			// Fully controlled: report only (via `onChange` below) and let the parent flow
			// the value back down through the `value` prop.
			if (controlledValue) return;
			value = next;
		},
		onChange: (next) => onChange?.(next),
		minValue: () => minValue,
		maxValue: () => maxValue,
		hourCycle: () => hourCycle,
		granularity: () => granularity,
		hourStep: () => hourStep,
		minuteStep: () => minuteStep,
		secondStep: () => secondStep,
		isEditable: () => !disabled && !readonly,
		// Any non-typing mutation invalidates the pending multi-digit buffer.
		// `typeSegmentDigit` re-seeds it explicitly after calling setSegmentValue.
		onBeforeSegmentMutation: (type) => {
			segmentTypeBuffer[type] = '';
		},
		onDraftReplaced: () => {
			segmentTypeBuffer = createEmptyTimePickerDraft();
		}
	});

	$effect(() => {
		if (open !== undefined && open !== openInternal) {
			openInternal = open;
		}
	});

	const segmentFormatter = $derived.by(
		() =>
			new Intl.DateTimeFormat(timeSelection.locale, {
				hour: 'numeric',
				minute: granularity !== 'hour' ? '2-digit' : undefined,
				second: granularity === 'second' ? '2-digit' : undefined,
				hourCycle: timeSelection.hourCycle === 12 ? 'h12' : 'h23',
				timeZone: 'UTC'
			})
	);

	const segments = $derived.by(() =>
		buildTimePickerSegments({
			locale: timeSelection.locale,
			hourCycle: timeSelection.hourCycle,
			granularity,
			draft: timeSelection.draft,
			formatter: segmentFormatter
		})
	);
	const segmentOrder = $derived(getEditableSegmentOrder(segments));

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

		// Fully controlled: the parent owns the state and flows it back down through the
		// `open` prop (the adopt effect above picks it up), so don't write it here.
		if (controlledOpen) return;

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

	function openPopover(reason: TimePickerOpenChangeReason = 'imperative-action', event?: Event) {
		if (disabled || readonly) return;
		setOpen(true, { reason, event });
	}

	function closePopover(reason: TimePickerOpenChangeReason = 'imperative-action', event?: Event) {
		setOpen(false, { reason, event });
	}

	function togglePopover(reason: TimePickerOpenChangeReason = 'trigger-press', event?: Event) {
		if (disabled || readonly) return;
		setOpen(!openInternal, { reason, event });
	}

	function getTypingThreshold(
		type: Exclude<TimePickerSegmentType, 'literal' | 'dayPeriod'>
	): number {
		if (type === 'hour') {
			return timeSelection.hourCycle === 12 ? 2 : 3;
		}
		return 6;
	}

	function typeSegmentDigit(
		type: Exclude<TimePickerSegmentType, 'literal'>,
		digit: string
	): boolean {
		if (disabled || readonly) return false;
		if (!/^\d$/.test(digit)) return false;
		if (type === 'dayPeriod') return false;

		const currentBuffer = (segmentTypeBuffer[type] || '').slice(0, 2);
		const seededBuffer = currentBuffer.length >= 2 ? '' : currentBuffer;
		let candidate = `${seededBuffer}${digit}`.slice(0, 2);
		if (!candidate) return false;

		const threshold = getTypingThreshold(type);
		if (candidate.length === 1) {
			timeSelection.setSegmentValue(type, candidate);
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
			min = timeSelection.hourCycle === 12 ? 1 : 0;
			max = timeSelection.hourCycle === 12 ? 12 : 23;
		}

		if (numericCandidate < min || numericCandidate > max) {
			candidate = digit;
			timeSelection.setSegmentValue(type, candidate);
			segmentTypeBuffer[type] = candidate;
			const fallbackNumeric = Number(candidate);
			if (fallbackNumeric >= threshold) {
				segmentTypeBuffer[type] = '';
				return true;
			}
			return false;
		}

		timeSelection.setSegmentValue(type, candidate);
		segmentTypeBuffer[type] = '';
		return true;
	}

	function adjustSegmentValue(type: Exclude<TimePickerSegmentType, 'literal'>, step: number) {
		if (disabled || readonly) return;
		if (type === 'dayPeriod') {
			timeSelection.draft.dayPeriod = timeSelection.draft.dayPeriod === 'PM' ? 'AM' : 'PM';
			timeSelection.commitDraft();
			return;
		}

		const current = timeSelection.getSegmentValue(type);
		const next = adjustSegmentWithStep(current, type, step, {
			hourCycle: timeSelection.hourCycle,
			hourStep,
			minuteStep,
			secondStep
		});

		timeSelection.setSegmentValue(type, next);
	}

	function registerSegmentRef(type: TimePickerEditableSegmentType, node: HTMLElement | null) {
		segmentRefs[type] = node;
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
			const currentValue = timeSelection.getSegmentValue(segmentType);
			if (isSegmentValueEmpty(currentValue)) {
				ref.focus();
				return true;
			}
		}
		return focusLastSegment();
	}

	const context: TimePickerContext = {
		get id() {
			return instanceId;
		},
		get isDisabled() {
			return disabled;
		},
		get isReadOnly() {
			return readonly;
		},
		get isRequired() {
			return required;
		},
		get granularity() {
			return granularity;
		},
		get hourCycle() {
			return timeSelection.hourCycle;
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
			return timeSelection.isInvalidDraft;
		},
		get value() {
			return timeSelection.value;
		},
		get locale() {
			return timeSelection.locale;
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
		setValue: timeSelection.setValue,
		getSegments: () => segments,
		getSegmentValue: timeSelection.getSegmentValue,
		setSegmentValue: timeSelection.setSegmentValue,
		typeSegmentDigit,
		adjustSegmentValue,
		getSegmentLabel: timeSelection.getSegmentLabel,
		registerSegmentRef,
		focusNextPlaceholderOrLastSegment,
		focusNextSegment,
		focusPreviousSegment,
		focusLastSegment,
		selectWheelValue: timeSelection.selectWheelValue,
		getSelectedWheelValue: timeSelection.getSelectedWheelValue,
		getWheelOptions: timeSelection.getWheelOptions
	};

	setTimePickerContext(context);
</script>

<div
	bind:this={rootRef}
	id={instanceId}
	class={className}
	role={ariaLabel ? 'group' : undefined}
	aria-label={ariaLabel}
>
	{#if children}
		{@render children()}
	{/if}
</div>
