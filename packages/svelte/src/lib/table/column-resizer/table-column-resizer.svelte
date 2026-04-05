<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useTableColumnContext, useTableContext } from '../root/context';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';

	type TableColumnResizerProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		step?: number;
		shiftStep?: number;
		children?: Snippet;
		class?: string;
	};

	let {
		step = 16,
		shiftStep = 48,
		children,
		class: className = '',
		...restProps
	}: TableColumnResizerProps = $props();

	const table = useTableContext();
	const column = useTableColumnContext();
	const resizeVersion = table.resizeVersion;
	const widthVersion = table.widthVersion;

	let element = $state<HTMLDivElement | undefined>(undefined);
	let isFocused = $state(false);
	let isFocusVisible = $state(false);
	let removeListeners: (() => void) | null = null;
	let resizeAnnouncement = $state('');
	let announceTimeout: ReturnType<typeof setTimeout> | null = null;

	const isResizing = $derived.by(() => {
		void $resizeVersion;
		return table.resizingColumnId === column.id;
	});
	const currentWidth = $derived.by(() => {
		void $widthVersion;
		return table.getColumnWidth(column.id) ?? getHeaderWidth();
	});
	const minWidth = $derived.by(() => {
		void $widthVersion;
		return table.getColumnMinWidth(column.id) ?? 75;
	});
	const maxWidth = $derived.by(() => {
		void $widthVersion;
		return table.getColumnMaxWidth(column.id);
	});
	const accessibleLabel = $derived.by(() => {
		const text = column.textValue?.trim() || column.id.replace(/[-_]+/g, ' ').trim();
		return `Resize ${text || 'column'} column`;
	});
	const accessibleValueText = $derived.by(() => {
		const width = currentWidth;
		if (width === undefined) return undefined;
		return `${width}px wide`;
	});

	function getAnnouncementLabel() {
		const text = column.textValue?.trim() || column.id.replace(/[-_]+/g, ' ').trim();
		return text || 'Column';
	}

	function getHeaderWidth() {
		return Math.round(element?.closest('th')?.getBoundingClientRect().width ?? 0);
	}

	function isRightToLeft() {
		const target = element?.closest('table') ?? element;
		return target ? getComputedStyle(target).direction === 'rtl' : false;
	}

	function cleanupPointerListeners() {
		removeListeners?.();
		removeListeners = null;
		table.endColumnResize();
	}

	function cleanupAnnouncementTimeout() {
		if (announceTimeout !== null) {
			clearTimeout(announceTimeout);
			announceTimeout = null;
		}
	}

	function updateWidth(nextWidth: number) {
		table.setColumnWidth(column.id, nextWidth);
	}

	function getResolvedWidth() {
		return table.getColumnWidth(column.id) ?? getHeaderWidth() ?? minWidth;
	}

	function announceWidth(width: number) {
		const message = `${getAnnouncementLabel()} width ${width}px.`;
		cleanupAnnouncementTimeout();
		resizeAnnouncement = '';
		announceTimeout = setTimeout(() => {
			resizeAnnouncement = message;
			announceTimeout = null;
		}, 0);
	}

	function commitWidthChange(nextWidth: number, options?: { announce?: boolean }) {
		table.startColumnResize(column.id);
		updateWidth(nextWidth);
		const committedWidth = getResolvedWidth();
		table.endColumnResize();
		if (options?.announce !== false) {
			announceWidth(committedWidth);
		}
		return committedWidth;
	}

	function getAutoFitWidth() {
		return table.measureColumnContentWidth(column.id) ?? minWidth;
	}

	function handleDoubleClick(event: MouseEvent) {
		if (!column.allowsResizing) return;
		event.preventDefault();
		event.stopPropagation();
		trackInteractionModality(event, element ?? null);
		isFocusVisible = false;

		commitWidthChange(getAutoFitWidth());
	}

	function handlePointerDown(event: PointerEvent) {
		if (!column.allowsResizing) return;
		if (event.pointerType === 'mouse' && event.button !== 0) return;
		if (event.isPrimary === false) return;
		event.preventDefault();
		event.stopPropagation();
		trackInteractionModality(event, element ?? null);
		isFocusVisible = false;

		table.startColumnResize(column.id);

		const th = element?.closest('th') as HTMLElement | null;
		const tableEl = th?.closest('table') as HTMLTableElement | null;
		const startX = event.clientX;
		const startWidth = table.getColumnWidth(column.id) ?? getHeaderWidth();
		const pointerId = event.pointerId;
		const isRTL = isRightToLeft();
		let didDrag = false;
		let latestClientX = startX;
		let animationFrameId: number | null = null;

		function clampWidth(w: number) {
			let clamped = Math.round(w);
			if (!Number.isFinite(clamped) || clamped < minWidth) clamped = minWidth;
			if (maxWidth !== undefined && clamped > maxWidth) clamped = maxWidth;
			return clamped;
		}

		function applyTemporaryWidthToDOM(width: number) {
			if (th) th.style.width = `${width}px`;
			if (tableEl) {
				const allThs = tableEl.querySelectorAll<HTMLElement>('thead th[style*="width"]');
				let total = 0;
				for (const cell of allThs) {
					total += parseFloat(cell.style.width) || 0;
				}
				if (total > 0) {
					tableEl.style.width = `${total}px`;
					tableEl.style.minWidth = '0';
				}
			}
		}

		function flushPendingPointerMove() {
			if (animationFrameId !== null) {
				cancelAnimationFrame(animationFrameId);
				animationFrameId = null;
			}

			const direction = isRTL ? -1 : 1;
			const delta = (latestClientX - startX) * positionScale * direction;
			const nextWidth = clampWidth(startWidth + delta);
			updateWidth(nextWidth);
		}

		function schedulePointerMove() {
			if (animationFrameId !== null) return;
			animationFrameId = requestAnimationFrame(() => {
				animationFrameId = null;
				flushPendingPointerMove();
			});
		}

		// Measure position compensation factor.
		// In centered/flex layouts, growing a column shifts the table's left edge,
		// so the handle moves less than the mouse delta. We detect this by applying
		// a 1px test change and measuring how much the <th> left edge drifts.
		let positionScale = 1;
		if (th) {
			const leftBefore = th.getBoundingClientRect().left;
			applyTemporaryWidthToDOM(startWidth + 1);
			const leftAfter = th.getBoundingClientRect().left;
			applyTemporaryWidthToDOM(startWidth);
			const drift = leftBefore - leftAfter;
			if (drift > 0.01 && drift < 0.99) {
				positionScale = 1 / (1 - drift);
			}
		}

		const handlePointerMove = (moveEvent: PointerEvent) => {
			if (moveEvent.pointerId !== pointerId) return;
			moveEvent.preventDefault();
			didDrag = true;
			latestClientX = moveEvent.clientX;
			schedulePointerMove();
		};

		const handlePointerUp = (upEvent: PointerEvent) => {
			if (upEvent.pointerId !== pointerId) return;
			if (didDrag) {
				latestClientX = upEvent.clientX;
				flushPendingPointerMove();
			}
			if (didDrag) {
				table.suppressHeaderClickOnce();
				announceWidth(getResolvedWidth());
			}
			cleanupPointerListeners();
		};

		const handlePointerCancel = (cancelEvent: PointerEvent) => {
			if (cancelEvent.pointerId !== pointerId) return;
			if (animationFrameId !== null) {
				cancelAnimationFrame(animationFrameId);
				animationFrameId = null;
			}
			cleanupPointerListeners();
		};

		const handleWindowKeyDown = (keyEvent: KeyboardEvent) => {
			if (keyEvent.key !== 'Escape') return;
			keyEvent.preventDefault();
			keyEvent.stopPropagation();
			if (animationFrameId !== null) {
				cancelAnimationFrame(animationFrameId);
				animationFrameId = null;
			}
			updateWidth(startWidth);
			cleanupPointerListeners();
		};

		window.addEventListener('pointermove', handlePointerMove);
		window.addEventListener('pointerup', handlePointerUp);
		window.addEventListener('pointercancel', handlePointerCancel);
		window.addEventListener('keydown', handleWindowKeyDown, true);
		removeListeners = () => {
			if (animationFrameId !== null) {
				cancelAnimationFrame(animationFrameId);
				animationFrameId = null;
			}
			window.removeEventListener('pointermove', handlePointerMove);
			window.removeEventListener('pointerup', handlePointerUp);
			window.removeEventListener('pointercancel', handlePointerCancel);
			window.removeEventListener('keydown', handleWindowKeyDown, true);
		};
	}

	function handleClick(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
	}

	function handleFocus() {
		isFocused = true;
		isFocusVisible = shouldShowFocusVisible(element ?? null);
	}

	function handleBlur() {
		isFocused = false;
		isFocusVisible = false;
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (!column.allowsResizing) return;
		trackInteractionModality(event, element ?? null);
		isFocusVisible = true;
		event.stopPropagation();

		const delta = event.shiftKey ? shiftStep : step;
		const direction = isRightToLeft() ? -1 : 1;
		const baseWidth = getResolvedWidth();

		switch (event.key) {
			case 'ArrowLeft':
				event.preventDefault();
				commitWidthChange(baseWidth - delta * direction);
				return;
			case 'ArrowRight':
				event.preventDefault();
				commitWidthChange(baseWidth + delta * direction);
				return;
			case 'Home':
				event.preventDefault();
				commitWidthChange(minWidth);
				return;
			case 'End':
				if (maxWidth === undefined) return;
				event.preventDefault();
				commitWidthChange(maxWidth);
				return;
		}
	}

	onDestroy(() => {
		cleanupAnnouncementTimeout();
		cleanupPointerListeners();
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	bind:this={element}
	role="separator"
	tabindex={column.allowsResizing ? 0 : undefined}
	class={className}
	aria-label={accessibleLabel}
	aria-orientation="vertical"
	aria-valuenow={currentWidth ?? undefined}
	aria-valuemin={minWidth}
	aria-valuemax={maxWidth}
	aria-valuetext={accessibleValueText}
	data-focused={isFocused ? 'true' : undefined}
	data-focus-visible={isFocusVisible ? 'true' : undefined}
	data-resizing={isResizing ? 'true' : undefined}
	data-resizable-direction="right"
	style:position="absolute"
	style:top="0"
	style:right="0"
	style:transform="translateX(50%)"
	style:width="0.75rem"
	style:height="100%"
	style:display="flex"
	style:align-items="center"
	style:justify-content="center"
	style:user-select="none"
	style:touch-action="none"
	onpointerdown={handlePointerDown}
	ondblclick={handleDoubleClick}
	onclick={handleClick}
	onfocus={handleFocus}
	onblur={handleBlur}
	onkeydown={handleKeyDown}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<span
			aria-hidden="true"
			style="display:block;width:1px;min-height:1rem;background:currentColor;opacity:0.35;"
		></span>
	{/if}
	<span
		data-testid="column-resize-status"
		role="status"
		aria-live="polite"
		aria-atomic="true"
		class="sr-only">{resizeAnnouncement}</span
	>
</div>
