<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { TimePickerSegmentPart } from '../root/context';
	import { useTimePickerContext } from '../root/context';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';
	import { isRtl } from '../../internal/rtl';

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
		| 'onbeforeinput'
		| 'oninput'
		| 'onpaste'
		| 'oncompositionend'
	> & {
		segment: TimePickerSegmentPart;
		class?: string;
	};

	let { segment, class: className = '', ...restProps }: TimePickerSegmentProps = $props();
	let isFocused = $state(false);
	let segmentRef: HTMLSpanElement | null = $state(null);
	let domResetVersion = $state(0);

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
		const segmentValue = timePicker.getSegmentValue(segment.type);
		if (segmentValue.length === 0) return undefined;
		const value = Number(segmentValue);
		return Number.isFinite(value) ? value : undefined;
	});

	const valueText = $derived.by(() => {
		if (segment.type === 'literal') return segment.text;
		// The dayPeriod segment text already reflects the locale's AM/PM display
		// strings, while the internal segment value keeps the 'AM'/'PM' tokens.
		if (segment.type === 'dayPeriod') return segment.text;
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

	function requestDomReset() {
		domResetVersion += 1;
	}

	function shouldResetDomForDrift(target: EventTarget | null | undefined): boolean {
		if (segment.type === 'literal') return false;
		const element = target instanceof HTMLElement ? target : segmentRef;
		if (!element) return false;
		return (element.textContent ?? '') !== segment.text;
	}

	function handleBeforeInput(event: InputEvent) {
		if (segment.type === 'literal') return;
		// The segment DOM stays authoritative: direct mutations from paste,
		// drop, or IME composition are blocked. Android/virtual keyboards
		// deliver characters through `beforeinput` instead of trusted keydown
		// events, so single-character insertions are routed to the typing path.
		event.preventDefault();
		if (timePicker.isDisabled || timePicker.isReadOnly) return;
		if (event.inputType !== 'insertText' || !event.data) return;
		if (segment.type === 'dayPeriod') {
			const character = event.data.toLowerCase();
			if (character === 'a') timePicker.setSegmentValue('dayPeriod', 'AM');
			if (character === 'p') timePicker.setSegmentValue('dayPeriod', 'PM');
			return;
		}
		if (!/^\d$/.test(event.data)) return;
		const didComplete = timePicker.typeSegmentDigit(segment.type, event.data);
		if (didComplete) {
			timePicker.focusNextSegment(segment.type);
		}
	}

	function handleInput(event: Event) {
		if (!shouldResetDomForDrift(event.currentTarget)) return;
		requestDomReset();
	}

	function handlePaste(event: ClipboardEvent) {
		if (segment.type === 'literal') return;
		event.preventDefault();
		if (!shouldResetDomForDrift(event.currentTarget)) return;
		requestDomReset();
	}

	function handleCompositionEnd(event: CompositionEvent) {
		if (!shouldResetDomForDrift(event.currentTarget)) return;
		requestDomReset();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (segment.type === 'literal') return;
		if (timePicker.isDisabled) return;
		// Never intercept browser/OS shortcuts (copy, select all, reload, ...).
		if (event.ctrlKey || event.metaKey || event.altKey) return;
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

		if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
			event.preventDefault();
			// Segments follow the locale's logical order in the DOM: under RTL
			// the visually next segment is the previous logical one, so the
			// physical arrows are inverted.
			const rtl = isRtl(event.currentTarget as HTMLElement);
			const isNext = rtl ? event.key === 'ArrowLeft' : event.key === 'ArrowRight';
			if (isNext) {
				if (!timePicker.focusNextSegment(segment.type)) {
					timePicker.triggerRef?.focus();
				}
				return;
			}
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
				timePicker.setSegmentValue('hour', timePicker.hourCycle === 12 ? '1' : '0');
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
				timePicker.setSegmentValue('hour', timePicker.hourCycle === 12 ? '12' : '23');
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

		// Only swallow unhandled printable characters. Function keys (Tab,
		// Escape, Enter, F5, ...) keep their default behavior so the browser,
		// forms, and enclosing popovers still receive them.
		if (event.key.length > 1) {
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
	{#key `${segmentId}-${domResetVersion}`}
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
			onbeforeinput={handleBeforeInput}
			oninput={handleInput}
			onpaste={handlePaste}
			oncompositionend={handleCompositionEnd}
		>
			{segment.text}
		</span>
	{/key}
{/if}
