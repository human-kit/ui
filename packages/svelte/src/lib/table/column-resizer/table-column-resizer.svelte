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

	function getHeaderWidth() {
		return Math.round(element?.closest('th')?.getBoundingClientRect().width ?? 0);
	}

	function cleanupPointerListeners() {
		removeListeners?.();
		removeListeners = null;
		table.endColumnResize();
	}

	function updateWidth(nextWidth: number) {
		table.setColumnWidth(column.id, nextWidth);
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

		table.startColumnResize(column.id);
		updateWidth(getAutoFitWidth());
		table.endColumnResize();
	}

	function handleMouseDown(event: MouseEvent) {
		if (!column.allowsResizing || event.button !== 0) return;
		event.preventDefault();
		event.stopPropagation();
		trackInteractionModality(event, element ?? null);
		isFocusVisible = false;

		table.startColumnResize(column.id);

		const th = element?.closest('th') as HTMLElement | null;
		const tableEl = th?.closest('table') as HTMLTableElement | null;
		const startX = event.clientX;
		const startWidth = table.getColumnWidth(column.id) ?? getHeaderWidth();
		let didDrag = false;

		function clampWidth(w: number) {
			let clamped = Math.round(w);
			if (!Number.isFinite(clamped) || clamped < minWidth) clamped = minWidth;
			if (maxWidth !== undefined && clamped > maxWidth) clamped = maxWidth;
			return clamped;
		}

		function applyWidthToDOM(width: number) {
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

		// Measure position compensation factor.
		// In centered/flex layouts, growing a column shifts the table's left edge,
		// so the handle moves less than the mouse delta. We detect this by applying
		// a 1px test change and measuring how much the <th> left edge drifts.
		let positionScale = 1;
		if (th) {
			const leftBefore = th.getBoundingClientRect().left;
			applyWidthToDOM(startWidth + 1);
			const leftAfter = th.getBoundingClientRect().left;
			applyWidthToDOM(startWidth);
			const drift = leftBefore - leftAfter;
			if (drift > 0.01 && drift < 0.99) {
				positionScale = 1 / (1 - drift);
			}
		}

		const handleMouseMove = (moveEvent: MouseEvent) => {
			moveEvent.preventDefault();
			didDrag = true;
			const delta = (moveEvent.clientX - startX) * positionScale;
			const nextWidth = clampWidth(startWidth + delta);
			applyWidthToDOM(nextWidth);
			updateWidth(nextWidth);
		};

		const handleMouseUp = () => {
			if (didDrag) {
				table.suppressHeaderClickOnce();
			}
			cleanupPointerListeners();
		};

		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp, { once: true });
		removeListeners = () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
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
		const baseWidth = currentWidth || getHeaderWidth();

		switch (event.key) {
			case 'ArrowLeft':
				event.preventDefault();
				updateWidth(baseWidth - delta);
				return;
			case 'ArrowRight':
				event.preventDefault();
				updateWidth(baseWidth + delta);
				return;
			case 'Home':
				event.preventDefault();
				updateWidth(minWidth);
				return;
			case 'End':
				if (maxWidth === undefined) return;
				event.preventDefault();
				updateWidth(maxWidth);
				return;
		}
	}

	onDestroy(() => {
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
	aria-valuenow={currentWidth || undefined}
	aria-valuemin={minWidth}
	aria-valuemax={maxWidth}
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
	onmousedown={handleMouseDown}
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
</div>
