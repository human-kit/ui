<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { TimePickerSegmentPart } from '../root/context';
	import { useTimePickerContext } from '../root/context';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';

	type TimePickerSegmentProps = Omit<
		HTMLAttributes<HTMLSpanElement>,
		| 'children'
		| 'class'
		| 'id'
		| 'role'
		| 'contenteditable'
		| 'tabindex'
		| 'aria-label'
		| 'aria-valuemin'
		| 'aria-valuemax'
		| 'aria-valuenow'
		| 'aria-valuetext'
		| 'aria-readonly'
		| 'aria-disabled'
		| 'onfocus'
		| 'onblur'
		| 'onmousedown'
		| 'onclick'
		| 'onselectstart'
		| 'onkeydown'
	> & {
		segment: TimePickerSegmentPart;
		class?: string;
	};

	let { segment, class: className = '', ...restProps }: TimePickerSegmentProps = $props();
	let isFocused = $state(false);
	let segmentRef: HTMLSpanElement | null = $state(null);

	const timePicker = useTimePickerContext();
	const segmentId = $props.id();

	const isEditableSegment = $derived(segment.type !== 'literal');
	const isActive = $derived(
		isEditableSegment && (timePicker.activeSegment === segment.type || isFocused)
	);
	const isFocusVisible = $derived(isFocused && timePicker.focusVisible);

	const valueMin = $derived.by(() => {
		if (segment.type === 'literal') return undefined;
		if (segment.type === 'hour') return timePicker.hourCycle === 12 ? 1 : 0;
		if (segment.type === 'minute' || segment.type === 'second') return 0;
		if (segment.type === 'dayPeriod') return 0;
		return undefined;
	});

	const valueMax = $derived.by(() => {
		if (segment.type === 'literal') return undefined;
		if (segment.type === 'hour') return timePicker.hourCycle === 12 ? 12 : 23;
		if (segment.type === 'minute' || segment.type === 'second') return 59;
		if (segment.type === 'dayPeriod') return 1;
		return undefined;
	});

	const valueNow = $derived.by(() => {
		if (segment.type === 'literal') return undefined;
		if (segment.type === 'dayPeriod') {
			const value = (timePicker.getSegmentValue('dayPeriod') || '').toUpperCase();
			if (!value) return undefined;
			return value === 'PM' ? 1 : 0;
		}
		const value = Number(timePicker.getSegmentValue(segment.type));
		return Number.isFinite(value) ? value : undefined;
	});

	const valueText = $derived.by(() => {
		if (segment.type === 'literal') return segment.text;
		return timePicker.getSegmentValue(segment.type) || segment.text;
	});

	const segmentLabel = $derived.by(() => {
		if (segment.type === 'literal') return undefined;
		return timePicker.getSegmentLabel(segment.type);
	});

	$effect(() => {
		if (segment.type === 'literal') return;
		const segmentType = segment.type;
		timePicker.registerSegmentRef(segmentType, segmentRef);
		return () => {
			timePicker.registerSegmentRef(segmentType, null);
		};
	});

	function handleFocus(event: FocusEvent) {
		if (segment.type === 'literal') return;
		if (timePicker.isDisabled) {
			isFocused = false;
			return;
		}
		isFocused = true;
		timePicker.syncFocusWithin();
		timePicker.setFocusVisible(shouldShowFocusVisible(event.currentTarget as HTMLElement));
		timePicker.setActiveSegment(segment.type);
	}

	function handleBlur() {
		if (segment.type === 'literal') return;
		isFocused = false;
		queueMicrotask(() => {
			timePicker.syncFocusWithin();
		});
	}

	function handleMouseDown(event: MouseEvent) {
		if (segment.type === 'literal') return;
		if (timePicker.isDisabled) {
			event.preventDefault();
			return;
		}
		trackInteractionModality(event, event.currentTarget as HTMLElement);
		timePicker.setFocusVisible(false);
		event.preventDefault();
		(event.currentTarget as HTMLElement).focus();
		timePicker.setActiveSegment(segment.type);
	}

	function handleClick(event: MouseEvent) {
		if (segment.type === 'literal') return;
		if (timePicker.isDisabled) {
			event.preventDefault();
			return;
		}
		(event.currentTarget as HTMLElement).focus();
		timePicker.setActiveSegment(segment.type);
	}

	function handleSelectStart(event: Event) {
		if (!segment.isPlaceholder) return;
		event.preventDefault();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (segment.type === 'literal') return;
		if (timePicker.isDisabled) return;
		trackInteractionModality(event, event.currentTarget as HTMLElement);
		timePicker.setFocusVisible(true);

		if (segment.type === 'dayPeriod') {
			if (event.key.toLowerCase() === 'a') {
				event.preventDefault();
				timePicker.setSegmentValue('dayPeriod', 'AM');
				return;
			}
			if (event.key.toLowerCase() === 'p') {
				event.preventDefault();
				timePicker.setSegmentValue('dayPeriod', 'PM');
				return;
			}
		}

		if (event.key === 'ArrowRight') {
			event.preventDefault();
			if (!timePicker.focusNextSegment(segment.type)) {
				timePicker.triggerRef?.focus();
			}
			return;
		}

		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			timePicker.focusPreviousSegment(segment.type);
			return;
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault();
			timePicker.adjustSegmentValue(segment.type, 1);
			return;
		}

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			timePicker.adjustSegmentValue(segment.type, -1);
			return;
		}

		if (event.key === 'PageUp') {
			event.preventDefault();
			const step = segment.type === 'hour' ? 1 : 5;
			timePicker.adjustSegmentValue(segment.type, step);
			return;
		}

		if (event.key === 'PageDown') {
			event.preventDefault();
			const step = segment.type === 'hour' ? 1 : 5;
			timePicker.adjustSegmentValue(segment.type, -step);
			return;
		}

		if (event.key === 'Home') {
			event.preventDefault();
			if (segment.type === 'hour') {
				timePicker.setSegmentValue('hour', '0');
			} else if (segment.type === 'minute') {
				timePicker.setSegmentValue('minute', '0');
			} else if (segment.type === 'second') {
				timePicker.setSegmentValue('second', '0');
			} else {
				timePicker.setSegmentValue('dayPeriod', 'AM');
			}
			return;
		}

		if (event.key === 'End') {
			event.preventDefault();
			if (segment.type === 'hour') {
				timePicker.setSegmentValue('hour', '23');
			} else if (segment.type === 'minute') {
				timePicker.setSegmentValue('minute', '59');
			} else if (segment.type === 'second') {
				timePicker.setSegmentValue('second', '59');
			} else {
				timePicker.setSegmentValue('dayPeriod', 'PM');
			}
			return;
		}

		if (event.key === 'Delete' || event.key === 'Backspace') {
			event.preventDefault();
			const currentValue = timePicker.getSegmentValue(segment.type);
			if (currentValue.length === 0) {
				if (event.key === 'Backspace') {
					timePicker.focusPreviousSegment(segment.type);
				}
				return;
			}
			timePicker.setSegmentValue(segment.type, currentValue.slice(0, -1));
			return;
		}

		if (event.key.length === 1 && /\d/.test(event.key)) {
			event.preventDefault();
			const didComplete = timePicker.typeSegmentDigit(segment.type, event.key);
			if (didComplete) {
				timePicker.focusNextSegment(segment.type);
			}
			return;
		}

		if (event.key === '/' || event.key === '-' || event.key === '.' || event.key === ':') {
			event.preventDefault();
			const currentValue = timePicker.getSegmentValue(segment.type);
			if (currentValue.length === 0) return;
			timePicker.focusNextSegment(segment.type);
			return;
		}

		if (event.key === 'Tab') {
			return;
		}

		event.preventDefault();
	}
</script>

{#if segment.type === 'literal'}
	<span
		class={className}
		{...restProps}
		data-placeholder={segment.isPlaceholder || undefined}
		data-type={segment.type}
		aria-hidden="true"
	>
		{segment.text}
	</span>
{:else}
	<span
		bind:this={segmentRef}
		id={segmentId}
		class={className}
		{...restProps}
		data-time-picker-segment="true"
		data-placeholder={segment.isPlaceholder || undefined}
		data-type={segment.type}
		data-focused={isActive ? 'true' : undefined}
		data-focus-visible={isFocusVisible ? 'true' : undefined}
		role="spinbutton"
		aria-valuetext={valueText}
		aria-valuemin={valueMin}
		aria-valuemax={valueMax}
		aria-valuenow={valueNow}
		aria-label={segmentLabel}
		aria-readonly={timePicker.isReadOnly || undefined}
		aria-disabled={timePicker.isDisabled || undefined}
		contenteditable={!timePicker.isDisabled && !timePicker.isReadOnly}
		spellcheck="false"
		enterkeyhint="next"
		inputmode={segment.type === 'dayPeriod' ? 'text' : 'numeric'}
		tabindex={timePicker.isDisabled ? -1 : 0}
		style={segment.isPlaceholder
			? 'caret-color: transparent; user-select: none;'
			: 'caret-color: transparent;'}
		onfocus={handleFocus}
		onblur={handleBlur}
		onmousedown={handleMouseDown}
		onclick={handleClick}
		onselectstart={handleSelectStart}
		onkeydown={handleKeydown}
	>
		{segment.text}
	</span>
{/if}
