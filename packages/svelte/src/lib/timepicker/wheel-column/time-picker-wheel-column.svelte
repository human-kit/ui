<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useTimePickerContext, type TimePickerEditableSegmentType } from '../root/context';
	import TimePickerWheelItem from '../wheel-item/time-picker-wheel-item.svelte';
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
		'children' | 'class' | 'role' | 'tabindex' | 'aria-label' | 'onkeydown'
	> & {
		type: TimePickerEditableSegmentType;
		children?: Snippet<[TimePickerWheelOption]>;
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

	const timePicker = useTimePickerContext();
	const options = $derived.by(() => timePicker.getWheelOptions(type));
	const selectedValue = $derived(timePicker.getSelectedWheelValue(type));
	const label = $derived(
		ariaLabel ?? (type === 'dayPeriod' ? 'Day period' : timePicker.getSegmentLabel(type))
	);

	let wheelRef: HTMLElement | null = null;
	let wheelApi: ReturnType<typeof useWheelScroll> | null = null;
	let resizeObserver: ResizeObserver | null = null;
	let itemHeight = $state(0);
	let spacerHeight = $state(0);
	let focusWithin = $state(false);
	let focusVisible = $state(false);
	let lastCenteredIndex = -1;
	let didAlignForCurrentOpen = false;

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
		const firstItem = wheelRef.querySelector<HTMLElement>('[data-wheel-item]');
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

	function handleSnapToIndex(nextIndex: number) {
		if (nextIndex < 0 || nextIndex >= options.length) return;
		const option = options[nextIndex];
		if (!option) return;

		const direction: 1 | -1 = lastCenteredIndex >= 0 && nextIndex < lastCenteredIndex ? -1 : 1;
		lastCenteredIndex = nextIndex;

		if (option.disabled) {
			const fallbackIndex = findClosestEnabledIndex(nextIndex, direction);
			if (fallbackIndex >= 0 && fallbackIndex !== nextIndex) {
				wheelApi?.scrollToIndex(fallbackIndex, 'smooth');
			}
			return;
		}

		if (selectedValue === option.value) return;
		timePicker.selectWheelValue(type, option.value);
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
		const panel = wheelRef?.closest<HTMLElement>('[data-time-picker-time-panel="true"]');
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
			timePicker.selectWheelValue(type, option.value);
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
			timePicker.selectWheelValue(type, option.value);
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

	function handleKeydown(event: KeyboardEvent) {
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
		if (index < 0 || index >= options.length) return;
		lastCenteredIndex = index;

		const option = options[index];
		if (option && !option.disabled && selectedValue !== option.value) {
			timePicker.selectWheelValue(type, option.value);
		}

		wheelApi?.scrollToIndex(index, 'smooth');
	}

	$effect(() => {
		if (!wheelRef) return;

		mountWheelApi();
		syncMeasurements();

		resizeObserver?.disconnect();
		resizeObserver = new ResizeObserver(() => {
			syncMeasurements();
		});
		resizeObserver.observe(wheelRef);

		return () => {
			resizeObserver?.disconnect();
			resizeObserver = null;
			destroyWheelApi();
		};
	});

	$effect(() => {
		if (!wheelRef || !wheelApi) return;
		if (!timePicker.open) {
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
	tabindex={timePicker.isDisabled ? -1 : 0}
	aria-label={label}
	aria-valuemin={minValue}
	aria-valuemax={maxValue}
	aria-valuenow={valueNow}
	aria-valuetext={valueText}
	aria-disabled={timePicker.isDisabled || undefined}
	data-focus-within={focusWithin || undefined}
	data-focus-visible={focusVisible || undefined}
	class={className}
	style="overflow-y:auto;position:relative;-webkit-overflow-scrolling:touch"
	onfocusin={handleFocusIn}
	onfocusout={handleFocusOut}
	onmousedown={handleMouseDown}
	onkeydown={handleKeydown}
	{...restProps}
>
	<div data-wheel-spacer="top" style={`height:${spacerHeight}px`}></div>
	{#each options as option, index (option.value)}
		{#if children}
			{@render children(option)}
		{:else}
			<TimePickerWheelItem
				{type}
				{option}
				selected={selectedValue === option.value}
				onrequestcenter={() => handleCenterRequest(index)}
				id={`${timePicker.id}-wheel-${type}-${option.value}`}
			/>
		{/if}
	{/each}
	<div data-wheel-spacer="bottom" style={`height:${spacerHeight}px`}></div>
	<div
		data-wheel-highlight
		style={`position:absolute;top:50%;transform:translateY(-50%);height:${Math.max(itemHeight, 1)}px;width:100%;pointer-events:none`}
	></div>
</div>
