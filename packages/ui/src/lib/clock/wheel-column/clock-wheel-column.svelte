<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { resolveLocalizedString } from '../../internal/localized-strings';
	import { useClockContext, type ClockEditableSegmentType } from '../root/context';
	import TimePickerWheelItem from '../wheel-item/clock-wheel-item.svelte';
	import { useWheelScroll, type WheelScrollBehavior } from '../hooks/use-wheel-scroll.svelte';
	import {
		focusWithModality,
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';

	type TimePickerWheelOption = {
		value: string;
		label: string;
		disabled: boolean;
	};

	type TimePickerWheelColumnProps = Omit<
		HTMLAttributes<HTMLDivElement>,
		| 'children'
		| 'class'
		| 'role'
		| 'tabindex'
		| 'aria-label'
		| 'onkeydown'
		| 'onfocusin'
		| 'onfocusout'
		| 'onmousedown'
		| 'onclick'
	> & {
		type: ClockEditableSegmentType;
		/** Receives the option and whether it is the column's selected value. */
		children?: Snippet<[TimePickerWheelOption, boolean]>;
		class?: string;
		'aria-label'?: string;
	};

	let {
		type,
		children,
		class: className = '',
		'aria-label': ariaLabel,
		...restProps
	}: TimePickerWheelColumnProps = $props();

	function hasExplicitHeightClass(value: string): boolean {
		return /(^|\s)(?:[\w-]+:)*(?:h-|min-h-|max-h-|size-)/.test(value);
	}

	const resolvedClassName = $derived.by(() => {
		const trimmed = className.trim();
		if (hasExplicitHeightClass(trimmed)) return trimmed;
		return trimmed.length > 0 ? `${trimmed} h-55` : 'h-55';
	});

	const clock = useClockContext();
	const options = $derived.by(() => clock.getWheelOptions(type));
	const selectedValue = $derived(clock.getSelectedWheelValue(type));
	const label = $derived(
		ariaLabel ?? (type === 'dayPeriod' ? 'Day period' : clock.getSegmentLabel(type))
	);
	const wheelRoleDescription = $derived(resolveLocalizedString(clock.locale, 'clock.wheelPicker'));

	let wheelRef: HTMLElement | null = null;
	let wheelApi: ReturnType<typeof useWheelScroll> | null = null;
	let resizeObserver: ResizeObserver | null = null;
	let resizeFrameId: number | null = null;
	let itemHeight = $state(0);
	let spacerHeight = $state(0);
	let focusWithin = $state(false);
	let focusVisible = $state(false);
	let lastCenteredIndex = -1;
	let didAlignForCurrentOpen = false;
	let lastOpenOptionsSignature = '';

	function getWheelItemElements(): HTMLElement[] {
		const taggedItems = Array.from(
			wheelRef?.querySelectorAll<HTMLElement>('[data-wheel-item]') ?? []
		);
		if (taggedItems.length > 0) return taggedItems;
		if (!wheelRef) return [];
		return Array.from(wheelRef.children).filter((child): child is HTMLElement => {
			if (!(child instanceof HTMLElement)) return false;
			if (child.matches('[data-wheel-spacer], [data-wheel-highlight], [role="status"], .sr-only')) {
				return false;
			}
			return true;
		});
	}

	const enabledOptionIndexes = $derived.by(() => {
		const indexes: number[] = [];
		for (let index = 0; index < options.length; index += 1) {
			if (!options[index].disabled) {
				indexes.push(index);
			}
		}
		return indexes;
	});

	const selectedIndex = $derived.by(() => {
		if (selectedValue === null) return -1;
		return options.findIndex((option) => option.value === selectedValue);
	});

	const selectedOption = $derived.by(() => {
		if (selectedIndex < 0) return null;
		return options[selectedIndex] ?? null;
	});

	const minValue = $derived.by(() => {
		const firstEnabledIndex = enabledOptionIndexes[0];
		if (firstEnabledIndex === undefined) return undefined;
		return getAriaValueNow(options[firstEnabledIndex]?.value ?? null);
	});

	const maxValue = $derived.by(() => {
		const lastEnabledIndex = enabledOptionIndexes[enabledOptionIndexes.length - 1];
		if (lastEnabledIndex === undefined) return undefined;
		return getAriaValueNow(options[lastEnabledIndex]?.value ?? null);
	});

	const valueNow = $derived.by(() => getAriaValueNow(selectedOption?.value ?? null));
	const valueText = $derived.by(() => selectedOption?.label ?? undefined);

	function getAriaValueNow(value: string | null): number | undefined {
		if (!value) return undefined;
		if (type === 'dayPeriod') {
			const normalized = value.toUpperCase();
			return normalized === 'PM' ? 1 : 0;
		}
		const numeric = Number(value);
		if (!Number.isFinite(numeric)) return undefined;
		return numeric;
	}

	function syncMeasurements() {
		if (!wheelRef) return;
		const firstItem = getWheelItemElements()[0] ?? null;
		if (!firstItem) return;

		const nextItemHeight = firstItem.offsetHeight;
		if (nextItemHeight <= 0) return;
		itemHeight = nextItemHeight;
		spacerHeight = Math.max(0, Math.floor((wheelRef.clientHeight - nextItemHeight) / 2));
	}

	function mountWheelApi() {
		if (!wheelRef) return;
		wheelApi?.destroy();
		wheelApi = useWheelScroll(wheelRef, handleSnapToIndex);
	}

	function destroyWheelApi() {
		wheelApi?.destroy();
		wheelApi = null;
	}

	function findClosestEnabledIndex(fromIndex: number, direction: 1 | -1): number {
		if (enabledOptionIndexes.length === 0) return -1;

		for (
			let index = Math.min(options.length - 1, Math.max(0, fromIndex));
			index >= 0 && index < options.length;
			index += direction
		) {
			if (!options[index]?.disabled) {
				return index;
			}
		}

		for (
			let index = Math.min(options.length - 1, Math.max(0, fromIndex));
			index >= 0 && index < options.length;
			index += direction * -1
		) {
			if (!options[index]?.disabled) {
				return index;
			}
		}

		return -1;
	}

	function handleSnapToIndex(nextIndex: number): number | null {
		if (clock.isDisabled) {
			// While disabled the wheel must not adopt a new position: re-snap to
			// the currently selected item so a scroll attempt can't leave the UI
			// visually desynced from the (guarded) value.
			if (selectedIndex >= 0) return selectedIndex;
			if (lastCenteredIndex >= 0) return lastCenteredIndex;
			return -1;
		}
		if (nextIndex < 0 || nextIndex >= options.length) return null;
		const option = options[nextIndex];
		if (!option) return null;

		const direction: 1 | -1 = lastCenteredIndex >= 0 && nextIndex < lastCenteredIndex ? -1 : 1;

		if (option.disabled) {
			const fallbackIndex = findClosestEnabledIndex(nextIndex, direction);
			if (fallbackIndex >= 0 && fallbackIndex !== nextIndex) {
				lastCenteredIndex = fallbackIndex;
				return fallbackIndex;
			}
			return null;
		}

		lastCenteredIndex = nextIndex;

		if (selectedValue !== option.value) {
			clock.selectWheelValue(type, option.value);
		}

		return nextIndex;
	}

	function scrollToSelected(behavior: 'smooth' | 'instant') {
		if (!wheelApi) return;
		if (options.length === 0) return;

		const nextIndex =
			selectedIndex >= 0
				? selectedIndex
				: enabledOptionIndexes[0] !== undefined
					? enabledOptionIndexes[0]
					: 0;

		if (nextIndex < 0) return;
		lastCenteredIndex = nextIndex;
		wheelApi.scrollToIndex(nextIndex, behavior);
	}

	function syncFocusWithin(currentTarget: HTMLElement) {
		focusWithin =
			!!document.activeElement &&
			(currentTarget === document.activeElement || currentTarget.contains(document.activeElement));
		if (!focusWithin) {
			focusVisible = false;
		}
	}

	function focusSiblingColumn(direction: 1 | -1): boolean {
		const panel = wheelRef?.closest<HTMLElement>('[data-clock="true"]');
		if (!panel || !wheelRef) return false;
		const columns = Array.from(panel.querySelectorAll<HTMLElement>('[role="spinbutton"]'));
		const currentIndex = columns.findIndex((column) => column === wheelRef);
		if (currentIndex < 0) return false;

		const nextIndex = currentIndex + direction;
		if (nextIndex < 0 || nextIndex >= columns.length) return false;

		const nextColumn = columns[nextIndex];
		focusWithModality(nextColumn, 'keyboard');
		return true;
	}

	function moveBy(step: number, behavior: WheelScrollBehavior = 'smooth') {
		if (options.length === 0) return;
		// Use lastCenteredIndex so rapid key-repeat steps correctly
		// instead of re-anchoring to the (potentially stale) reactive value.
		const anchor =
			lastCenteredIndex >= 0
				? lastCenteredIndex
				: selectedIndex >= 0
					? selectedIndex
					: (enabledOptionIndexes[0] ?? 0);
		const target = findClosestEnabledIndex(anchor + step, step < 0 ? -1 : 1);
		if (target < 0) return;
		lastCenteredIndex = target;

		// Immediately update value so the UI reacts without waiting for scrollend.
		const option = options[target];
		if (option && !option.disabled && selectedValue !== option.value) {
			clock.selectWheelValue(type, option.value);
		}

		wheelApi?.scrollToIndex(target, behavior);
	}

	function moveToBoundary(boundary: 'start' | 'end', behavior: WheelScrollBehavior = 'smooth') {
		if (enabledOptionIndexes.length === 0) return;
		const target =
			boundary === 'start'
				? enabledOptionIndexes[0]
				: enabledOptionIndexes[enabledOptionIndexes.length - 1];
		lastCenteredIndex = target;

		const option = options[target];
		if (option && !option.disabled && selectedValue !== option.value) {
			clock.selectWheelValue(type, option.value);
		}

		wheelApi?.scrollToIndex(target, behavior);
	}

	function handleFocusIn(event: FocusEvent) {
		focusWithin = true;
		focusVisible = shouldShowFocusVisible(event.target as HTMLElement | null);
	}

	function handleFocusOut(event: FocusEvent) {
		const currentTarget = event.currentTarget as HTMLElement;
		queueMicrotask(() => syncFocusWithin(currentTarget));
	}

	function handleMouseDown(event: MouseEvent) {
		trackInteractionModality(event, event.target as HTMLElement | null);
		focusVisible = false;
	}

	function handleClick(event: MouseEvent) {
		if (clock.isDisabled) return;
		// Default wheel items already handled this click (they call
		// onRequestCenter and mark the event via preventDefault): skip the
		// container fallback so a single click centers only once.
		if (event.defaultPrevented) return;
		const target = event.target as Node | null;
		if (!target) return;
		const items = getWheelItemElements();
		const index = items.findIndex((item) => item === target || item.contains(target));
		if (index >= 0) {
			handleCenterRequest(index);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (clock.isDisabled) return;
		trackInteractionModality(event, event.target as HTMLElement | null);
		if (focusWithin) {
			focusVisible = true;
		}

		// When a key is held down (repeat), use instant scrolling so the column
		// flies through items instead of queuing up slow smooth-scroll animations.
		const kb: WheelScrollBehavior = event.repeat ? 'instant' : 'smooth';

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			moveBy(1, kb);
			return;
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault();
			moveBy(-1, kb);
			return;
		}

		if (event.key === 'PageDown') {
			event.preventDefault();
			moveBy(type === 'dayPeriod' ? 1 : 5, kb);
			return;
		}

		if (event.key === 'PageUp') {
			event.preventDefault();
			moveBy(type === 'dayPeriod' ? -1 : -5, kb);
			return;
		}

		if (event.key === 'Home') {
			event.preventDefault();
			moveToBoundary('start', kb);
			return;
		}

		if (event.key === 'End') {
			event.preventDefault();
			moveToBoundary('end', kb);
			return;
		}

		if (event.key === 'ArrowRight') {
			event.preventDefault();
			focusSiblingColumn(1);
			return;
		}

		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			focusSiblingColumn(-1);
		}
	}

	function handleCenterRequest(index: number) {
		if (clock.isDisabled) return;
		if (index < 0 || index >= options.length) return;
		const option = options[index];
		if (!option || option.disabled) return;

		lastCenteredIndex = index;

		if (selectedValue !== option.value) {
			clock.selectWheelValue(type, option.value);
		}

		wheelApi?.scrollToIndex(index, 'smooth', { silent: true });
	}

	$effect(() => {
		if (!wheelRef) return;

		mountWheelApi();
		syncMeasurements();

		resizeObserver?.disconnect();
		resizeObserver = new ResizeObserver(() => {
			if (resizeFrameId !== null) {
				cancelAnimationFrame(resizeFrameId);
			}
			resizeFrameId = requestAnimationFrame(() => {
				resizeFrameId = null;
				syncMeasurements();
			});
		});
		resizeObserver.observe(wheelRef);

		return () => {
			if (resizeFrameId !== null) {
				cancelAnimationFrame(resizeFrameId);
				resizeFrameId = null;
			}
			resizeObserver?.disconnect();
			resizeObserver = null;
			destroyWheelApi();
		};
	});

	$effect(() => {
		if (!clock.open || !wheelApi) return;
		if (selectedIndex < 0) return;
		if (selectedIndex === lastCenteredIndex) return;
		lastCenteredIndex = selectedIndex;
		wheelApi.scrollToIndex(selectedIndex, 'instant');
	});

	$effect(() => {
		const optionsSignature = options
			.map((option) => `${option.value}:${option.disabled ? 1 : 0}`)
			.join('|');
		const nextSignature = `${clock.open ? 1 : 0}::${optionsSignature}`;
		if (lastOpenOptionsSignature !== nextSignature) {
			lastOpenOptionsSignature = nextSignature;
			didAlignForCurrentOpen = false;
		}
	});

	$effect(() => {
		if (!wheelRef || !wheelApi) return;
		if (!clock.open) {
			didAlignForCurrentOpen = false;
			return;
		}
		if (didAlignForCurrentOpen) return;
		if (options.length === 0) return;
		// Guard: wait until syncMeasurements() has run (itemHeight > 0).
		// itemHeight is $state, so the effect will re-run once it's set.
		if (itemHeight <= 0) return;

		didAlignForCurrentOpen = true;

		// Defer to rAF so the DOM has been painted with the correct spacer
		// heights.  Without this, offsetTop calculations are wrong because
		// Svelte batches state→DOM updates and the spacers still have the
		// stale height when effects run synchronously.
		const rafId = requestAnimationFrame(() => {
			syncMeasurements();
			scrollToSelected('instant');
		});

		return () => cancelAnimationFrame(rafId);
	});
</script>

<div
	bind:this={wheelRef}
	role="spinbutton"
	tabindex={clock.isDisabled ? -1 : 0}
	aria-label={label}
	aria-valuemin={minValue}
	aria-valuemax={maxValue}
	aria-valuenow={valueNow}
	aria-valuetext={valueText}
	aria-roledescription={wheelRoleDescription}
	aria-disabled={clock.isDisabled || undefined}
	data-focus-within={focusWithin || undefined}
	data-focus-visible={focusVisible || undefined}
	class={resolvedClassName}
	style="overflow-y:auto;position:relative;-webkit-overflow-scrolling:touch"
	onfocusin={handleFocusIn}
	onfocusout={handleFocusOut}
	onmousedown={handleMouseDown}
	onclick={handleClick}
	onkeydown={handleKeydown}
	{...restProps}
>
	<div data-wheel-spacer="top" style={`height:${spacerHeight}px`}></div>
	<!--
		Visually-hidden live region using inline styles so the headless library
		does not depend on an external `sr-only` utility class (e.g. Tailwind).
		Kept in addition to aria-valuetext: valuetext changes are only announced
		while the spinbutton has DOM focus, whereas this also covers pointer and
		touch scrolling without focus.
	-->
	<span
		role="status"
		aria-live="polite"
		style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0"
		>{valueText}</span
	>
	{#each options as option, index (option.value)}
		{#if children}
			{@render children(option, selectedValue === option.value)}
		{:else}
			<TimePickerWheelItem
				{type}
				{option}
				selected={selectedValue === option.value}
				onRequestCenter={() => handleCenterRequest(index)}
				id={`${clock.id}-wheel-${type}-${option.value}`}
			/>
		{/if}
	{/each}
	<div data-wheel-spacer="bottom" style={`height:${spacerHeight}px`}></div>
	<div
		data-wheel-highlight
		style={`position:absolute;top:50%;transform:translateY(-50%);height:${Math.max(itemHeight, 1)}px;width:100%;pointer-events:none`}
	></div>
</div>
