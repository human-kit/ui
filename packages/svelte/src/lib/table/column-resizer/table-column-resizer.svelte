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
	const layoutVersion = table.layoutVersion;
	const resizeVersion = table.resizeVersion;
	const widthVersion = table.widthVersion;
	table.registerColumnResizer(column.token);

	let element = $state<HTMLDivElement | undefined>(undefined);
	let isFocused = $state(false);
	let isFocusVisible = $state(false);
	let keyboardResizeActive = $state(false);
	let keyboardResizeStartWidth = $state<number | null>(null);
	let removeListeners: (() => void) | null = null;
	let resizeAnnouncement = $state('');
	let announceTimeout: ReturnType<typeof setTimeout> | null = null;
	let focusHeaderTimeout: ReturnType<typeof setTimeout> | null = null;

	const isResizing = $derived.by(() => {
		void $resizeVersion;
		return table.resizingColumnId === column.id;
	});
	const isResizable = $derived.by(() => {
		void $layoutVersion;
		return !column.isHidden && table.isColumnResizable(column.id);
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

	function cleanupFocusHeaderTimeout() {
		if (focusHeaderTimeout !== null) {
			clearTimeout(focusHeaderTimeout);
			focusHeaderTimeout = null;
		}
	}

	function focusHeaderCell() {
		const headerCell = element?.closest('th') as HTMLElement | null;
		headerCell?.focus();
	}

	function focusAdjacentHeaderCell(direction: 'left' | 'right') {
		const headerCell = element?.closest('th') as HTMLElement | null;
		const headerRow = headerCell?.closest('tr');
		if (!headerCell || !headerRow) return false;

		const headerCells = Array.from(
			headerRow.querySelectorAll<HTMLElement>('th[role="columnheader"]')
		);
		const currentIndex = headerCells.indexOf(headerCell);
		if (currentIndex < 0) return false;

		const target = headerCells[currentIndex + (direction === 'left' ? -1 : 1)] ?? null;
		target?.focus();
		return document.activeElement === target;
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
		updateWidth(nextWidth);
		const committedWidth = getResolvedWidth();
		if (options?.announce !== false) {
			announceWidth(committedWidth);
		}
		return committedWidth;
	}

	function startKeyboardResizeMode() {
		if (keyboardResizeActive) return;
		keyboardResizeActive = true;
		keyboardResizeStartWidth = getResolvedWidth();
		table.startColumnResize(column.id);
	}

	function stopKeyboardResizeMode(options?: { restoreWidth?: boolean; focusHeader?: boolean }) {
		if (options?.restoreWidth && keyboardResizeStartWidth !== null) {
			updateWidth(keyboardResizeStartWidth);
		}

		const wasActive = keyboardResizeActive;
		keyboardResizeActive = false;
		keyboardResizeStartWidth = null;

		if (wasActive) {
			table.endColumnResize();
		}

		if (options?.focusHeader) {
			cleanupFocusHeaderTimeout();
			focusHeaderTimeout = setTimeout(() => {
				focusHeaderTimeout = null;
				focusHeaderCell();
			}, 0);
		}
	}

	function getAutoFitWidth() {
		return table.measureColumnContentWidth(column.id) ?? minWidth;
	}

	function handleDoubleClick(event: MouseEvent) {
		if (!isResizable) return;
		event.preventDefault();
		event.stopPropagation();
		trackInteractionModality(event, element ?? null);
		isFocusVisible = false;
		stopKeyboardResizeMode();

		table.startColumnResize(column.id);
		commitWidthChange(getAutoFitWidth());
		table.endColumnResize();
	}

	function handlePointerDown(event: PointerEvent) {
		if (!isResizable) return;
		if (event.pointerType === 'mouse' && event.button !== 0) return;
		if (event.isPrimary === false) return;
		event.preventDefault();
		event.stopPropagation();
		trackInteractionModality(event, element ?? null);
		isFocusVisible = false;

		stopKeyboardResizeMode();
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

		// Capture the pointer so we receive move/up events even if the cursor
		// leaves the browser viewport (e.g. in iframes or when dragging fast).
		// The try-catch guards against synthetic events with no active pointer.
		try {
			element?.setPointerCapture(pointerId);
		} catch {
			/* synthetic event */
		}

		// Note: final clamping is authoritative in context.clampColumnWidth().
		// This local pre-clamp avoids sending clearly out-of-range values through
		// the reactive pipeline during drag, reducing unnecessary width notifications.
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
		// NOTE: applyTemporaryWidthToDOM intentionally mutates the DOM synchronously
		// outside Svelte's reactive cycle. The mutation is immediately reverted
		// within the same microtask, so no observer or $effect will see it.
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
			// Treat system-initiated cancellation the same as Escape:
			// restore the width the column had before the drag started.
			updateWidth(startWidth);
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

		// With pointer capture active the browser routes all pointer events for
		// this pointerId to the capturing element. Those events then bubble up
		// to window, so we keep using window listeners — this also works in test
		// environments that dispatch synthetic events directly on window.
		window.addEventListener('pointermove', handlePointerMove);
		window.addEventListener('pointerup', handlePointerUp);
		window.addEventListener('pointercancel', handlePointerCancel);
		window.addEventListener('keydown', handleWindowKeyDown, true);
		removeListeners = () => {
			if (animationFrameId !== null) {
				cancelAnimationFrame(animationFrameId);
				animationFrameId = null;
			}
			try {
				element?.releasePointerCapture(pointerId);
			} catch {
				/* already released */
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
		stopKeyboardResizeMode();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (!isResizable) return;
		trackInteractionModality(event, element ?? null);
		isFocusVisible = true;

		if ((event.ctrlKey || event.metaKey) && event.key === 'Home') {
			event.preventDefault();
			event.stopPropagation();
			table.moveToGridStart();
			return;
		}

		if ((event.ctrlKey || event.metaKey) && event.key === 'End') {
			event.preventDefault();
			event.stopPropagation();
			table.moveToGridEnd();
			return;
		}

		if (!keyboardResizeActive) {
			switch (event.key) {
				case 'Enter':
					event.preventDefault();
					if (event.repeat) return;
					event.stopPropagation();
					startKeyboardResizeMode();
					return;
				case 'ArrowLeft':
					event.preventDefault();
					event.stopPropagation();
					focusHeaderCell();
					return;
				case 'ArrowRight':
					event.preventDefault();
					event.stopPropagation();
					focusAdjacentHeaderCell('right');
					return;
				case 'ArrowUp':
					event.preventDefault();
					event.stopPropagation();
					table.moveFocus('up');
					return;
				case 'ArrowDown':
					event.preventDefault();
					event.stopPropagation();
					table.moveFocus('down');
					return;
				case 'Home':
					event.preventDefault();
					event.stopPropagation();
					focusHeaderCell();
					table.moveToRowStart();
					return;
				case 'End':
					event.preventDefault();
					event.stopPropagation();
					focusHeaderCell();
					table.moveToRowEnd();
					return;
			}
			return;
		}

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
				event.preventDefault();
				commitWidthChange(getAutoFitWidth());
				return;
			case 'Enter':
				event.preventDefault();
				stopKeyboardResizeMode();
				return;
			case 'Escape':
				event.preventDefault();
				stopKeyboardResizeMode({ restoreWidth: true, focusHeader: true });
				return;
		}
	}

	onDestroy(() => {
		cleanupAnnouncementTimeout();
		cleanupFocusHeaderTimeout();
		stopKeyboardResizeMode();
		cleanupPointerListeners();
		table.unregisterColumnResizer(column.token);
	});
</script>

{#if !column.isHidden}
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		bind:this={element}
		role="separator"
		tabindex={isResizable ? 0 : undefined}
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
		data-table-column-resizer="true"
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
			style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;"
			>{resizeAnnouncement}</span
		>
	</div>
{/if}
