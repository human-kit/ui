<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../../utils/cn';
	import { useNumberFieldContext } from '../root/context';

	type NumberFieldScrubDirection = 'horizontal' | 'vertical';

	type NumberFieldScrubAreaProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'class'> & {
		children?: Snippet;
		class?: string;
		direction?: NumberFieldScrubDirection;
		pixelSensitivity?: number;
		teleportDistance?: number;
	};

	type ScrubPointerEvent = PointerEvent & { currentTarget: EventTarget & HTMLSpanElement };

	let {
		children,
		class: className,
		direction = 'horizontal',
		pixelSensitivity = 2,
		teleportDistance,
		onpointerdown,
		onpointermove,
		onpointerup,
		onpointercancel,
		...restProps
	}: NumberFieldScrubAreaProps = $props();

	const numberField = useNumberFieldContext();
	let isPointerScrubbing = $state(false);
	let lastCoordinate = $state(0);
	let accumulatedDelta = $state(0);

	const resolvedPixelSensitivity = $derived(
		Number.isFinite(pixelSensitivity) && pixelSensitivity > 0 ? pixelSensitivity : 2
	);

	function getCoordinate(event: PointerEvent): number {
		return direction === 'vertical' ? -event.clientY : event.clientX;
	}

	function startScrub(event: ScrubPointerEvent) {
		if (numberField.isDisabled || numberField.isReadOnly || event.button !== 0) return;

		event.preventDefault();
		const target = event.currentTarget as HTMLSpanElement;
		try {
			target.setPointerCapture(event.pointerId);
		} catch {
			// Synthetic test events and older browsers can fail pointer capture.
		}
		isPointerScrubbing = true;
		lastCoordinate = getCoordinate(event);
		accumulatedDelta = 0;
		numberField.inputRef?.focus();
		numberField.syncFocusWithin();
		numberField.setScrubbing(true);
		onpointerdown?.(event);
	}

	function updateScrub(event: ScrubPointerEvent) {
		if (!isPointerScrubbing) {
			onpointermove?.(event);
			return;
		}

		event.preventDefault();
		const coordinate = getCoordinate(event);
		const nextDelta = accumulatedDelta + coordinate - lastCoordinate;
		const ticks = Math.trunc(nextDelta / resolvedPixelSensitivity);
		lastCoordinate = coordinate;

		if (ticks !== 0) {
			numberField.stepBy(ticks > 0 ? 1 : -1, {
				reason: 'scrub',
				event,
				multiplier: Math.abs(ticks)
			});
			accumulatedDelta = nextDelta - ticks * resolvedPixelSensitivity;
		} else {
			accumulatedDelta = nextDelta;
		}

		if (teleportDistance && Math.abs(accumulatedDelta) > teleportDistance) {
			accumulatedDelta = 0;
		}

		onpointermove?.(event);
	}

	function stopScrub(event: ScrubPointerEvent) {
		if (isPointerScrubbing) {
			const target = event.currentTarget as HTMLSpanElement;
			try {
				if (target.hasPointerCapture(event.pointerId)) {
					target.releasePointerCapture(event.pointerId);
				}
			} catch {
				// Ignore pointer capture cleanup failures from synthetic events.
			}
		}

		isPointerScrubbing = false;
		accumulatedDelta = 0;
		numberField.setScrubbing(false);
		numberField.commitInputValue('scrub', event);
		onpointerup?.(event);
	}

	function cancelScrub(event: ScrubPointerEvent) {
		isPointerScrubbing = false;
		accumulatedDelta = 0;
		numberField.setScrubbing(false);
		onpointercancel?.(event);
	}
</script>

<span
	{...restProps}
	class={cn(className)}
	data-number-field-scrub-area="true"
	data-disabled={numberField.isDisabled || undefined}
	data-readonly={numberField.isReadOnly || undefined}
	data-invalid={numberField.isInvalid || undefined}
	data-scrubbing={numberField.scrubbing || undefined}
	data-direction={direction}
	onpointerdown={startScrub}
	onpointermove={updateScrub}
	onpointerup={stopScrub}
	onpointercancel={cancelScrub}
>
	{@render children?.()}
</span>
