<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { shouldShowFocusVisible, trackInteractionModality } from '../primitives/input-modality';
	import type { ClassValue } from '../utils/cn';
	import { composeEventHandlers } from '../utils/compose-event-handlers';

	export type DropzoneRenderState = {
		/** A drag is currently hovering the zone with droppable file content. */
		dragging: boolean;
		/** The pointer is hovering the zone (mirrors `data-hovered`). */
		hovered: boolean;
		focused: boolean;
		focusVisible: boolean;
		disabled: boolean;
	};

	type DropzoneProps = Omit<
		HTMLButtonAttributes,
		'children' | 'disabled' | 'aria-disabled' | 'type'
	> & {
		children?: Snippet<[DropzoneRenderState]> | Snippet;
		class?: ClassValue;
		disabled?: boolean;
		/**
		 * Forwarded to the hidden file input's `accept` and used to filter
		 * dropped/pasted files. MIME tokens (`image/png`, `image/*`) match against
		 * `File.type`; files with an empty MIME type (common for uncommon
		 * extensions or OS-level drops) can only match extension tokens (`.ext`),
		 * so include the extensions you care about alongside MIME types.
		 */
		accept?: string;
		/** Allow selecting or dropping more than one file. */
		multiple?: boolean;
		/** Emitted with the accepted files picked via click or drop. */
		onFilesPicked?: (files: File[]) => void;
		/** Emitted with the files filtered out by `accept` (click or drop), so rejections aren't silent. */
		onFilesRejected?: (files: File[]) => void;
		/** Visually-hidden polite live-region message (announce results or errors after a pick). */
		announcement?: string;
		element?: HTMLButtonElement | null;
	};

	function parseAccept(accept: string | undefined): string[] {
		if (!accept) return [];
		return accept
			.split(',')
			.map((token) => token.trim().toLowerCase())
			.filter(Boolean);
	}

	function fileMatchesAccept(file: File, tokens: string[]): boolean {
		if (tokens.length === 0) return true;
		const name = file.name.toLowerCase();
		const type = file.type.toLowerCase();
		return tokens.some((token) => {
			if (token.startsWith('.')) return name.endsWith(token);
			if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1));
			return type === token;
		});
	}

	const generatedId = $props.id();

	let {
		id,
		children,
		class: className = '',
		disabled = false,
		accept,
		multiple = false,
		onFilesPicked,
		onFilesRejected,
		announcement = '',
		element = $bindable<HTMLButtonElement | null>(null),
		onclick: onClickExternal,
		onfocus: onFocusExternal,
		onblur: onBlurExternal,
		onkeydown: onKeyDownExternal,
		onmousedown: onMouseDownExternal,
		onpointerdown: onPointerDownExternal,
		onmouseenter: onMouseEnterExternal,
		onmouseleave: onMouseLeaveExternal,
		ondragover: onDragOverExternal,
		ondragenter: onDragEnterExternal,
		ondragleave: onDragLeaveExternal,
		ondragend: onDragEndExternal,
		ondrop: onDropExternal,
		onpaste: onPasteExternal,
		'aria-label': ariaLabel,
		...restProps
	}: DropzoneProps = $props();

	const resolvedId = untrack(() => id) ?? generatedId;

	let buttonRef: HTMLButtonElement | null = $state(null);
	let inputRef: HTMLInputElement | null = $state(null);
	let dragging = $state(false);
	// dragenter/dragleave pairs fired while crossing children; `relatedTarget` is
	// null in WebKit drag events, so a counter is the reliable anti-flicker.
	let dragCounter = 0;
	let hovered = $state(false);
	let focused = $state(false);
	let focusVisible = $state(false);

	const acceptTokens = $derived(parseAccept(accept));
	const renderState = $derived.by<DropzoneRenderState>(() => ({
		dragging,
		hovered,
		focused,
		focusVisible,
		disabled
	}));

	$effect(() => {
		element = buttonRef;
		return () => {
			element = null;
		};
	});

	$effect(() => {
		if (!disabled) return;
		dragging = false;
		dragCounter = 0;
		hovered = false;
		focused = false;
		focusVisible = false;
	});

	function emitFiles(fileList: FileList | File[] | null) {
		if (!fileList) return;
		const rejected = Array.from(fileList).filter((file) => !fileMatchesAccept(file, acceptTokens));
		if (rejected.length > 0) onFilesRejected?.(rejected);
		let files = Array.from(fileList).filter((file) => fileMatchesAccept(file, acceptTokens));
		if (!multiple) files = files.slice(0, 1);
		if (files.length === 0) return;
		onFilesPicked?.(files);
	}

	function dragHasFiles(event: DragEvent): boolean {
		const items = event.dataTransfer?.items;
		if (!items || items.length === 0) return Boolean(event.dataTransfer?.types.includes('Files'));
		return Array.from(items).some((item) => item.kind === 'file');
	}

	function openPicker() {
		inputRef?.click();
	}

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		// The external handler runs first so the consumer can cancel the picker
		// opening with `event.preventDefault()`.
		onClickExternal?.(event);
		if (event.defaultPrevented) return;
		if (disabled) return;
		openPicker();
	}

	function handleInputChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		emitFiles(input.files);
		// Reset so picking the same file again still fires `change`.
		input.value = '';
	}

	function handleDragOver(event: DragEvent) {
		if (disabled || !dragHasFiles(event)) return;
		event.preventDefault();
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
		dragging = true;
	}

	function handleDragEnter(event: DragEvent) {
		if (disabled || !dragHasFiles(event)) return;
		event.preventDefault();
		dragCounter += 1;
		dragging = true;
	}

	function handleDragLeave() {
		dragCounter = Math.max(0, dragCounter - 1);
		dragging = dragCounter > 0;
	}

	function handleDragEnd() {
		dragCounter = 0;
		dragging = false;
	}

	function extractDroppedFiles(dataTransfer: DataTransfer | null): FileList | File[] | null {
		if (!dataTransfer) return null;
		const items = dataTransfer.items;
		// Prefer `DataTransferItem` entries when the browser exposes them:
		// `webkitGetAsEntry` can tell files from directories, which
		// `dataTransfer.files` cannot (a dropped folder shows up there as a
		// zero-type `File`). Fall back to `files` otherwise.
		if (items && items.length > 0 && typeof items[0]?.webkitGetAsEntry === 'function') {
			const files: File[] = [];
			for (const item of Array.from(items)) {
				if (item.kind !== 'file') continue;
				const entry = item.webkitGetAsEntry();
				// A null entry (e.g. synthetic drops) is kept; only known
				// non-file entries (directories) are filtered out.
				if (entry && !entry.isFile) continue;
				const file = item.getAsFile();
				if (file) files.push(file);
			}
			return files;
		}
		return dataTransfer.files;
	}

	function handleDrop(event: DragEvent) {
		if (disabled) return;
		event.preventDefault();
		dragCounter = 0;
		dragging = false;
		emitFiles(extractDroppedFiles(event.dataTransfer));
	}

	function handlePaste(event: ClipboardEvent) {
		if (disabled) return;
		const files = event.clipboardData?.files;
		if (!files || files.length === 0) return;
		event.preventDefault();
		emitFiles(files);
	}

	function handleFocus() {
		if (disabled) return;
		focused = true;
		focusVisible = shouldShowFocusVisible(buttonRef);
	}

	function handleBlur() {
		focused = false;
		focusVisible = false;
	}

	function handleKeyDown(event: KeyboardEvent) {
		trackInteractionModality(event, buttonRef);
		focusVisible = focused ? true : shouldShowFocusVisible(buttonRef);
	}

	function handleMouseDown(event: MouseEvent) {
		trackInteractionModality(event, buttonRef);
		focusVisible = false;
	}

	function handlePointerDown(event: PointerEvent) {
		trackInteractionModality(event, buttonRef);
		focusVisible = false;
	}

	function handleMouseEnter() {
		if (disabled) {
			hovered = false;
			return;
		}
		hovered = true;
	}

	function handleMouseLeave() {
		hovered = false;
	}
</script>

<button
	{...restProps}
	bind:this={buttonRef}
	id={resolvedId}
	type="button"
	{disabled}
	aria-label={ariaLabel}
	data-dropzone-root="true"
	data-disabled={disabled || undefined}
	data-drop-target={dragging || undefined}
	data-hovered={hovered || undefined}
	data-focused={focused || undefined}
	data-focus-visible={focusVisible || undefined}
	class={className}
	onclick={handleClick}
	onfocus={composeEventHandlers(handleFocus, onFocusExternal ?? undefined)}
	onblur={composeEventHandlers(handleBlur, onBlurExternal ?? undefined)}
	onkeydown={composeEventHandlers(handleKeyDown, onKeyDownExternal ?? undefined)}
	onmousedown={composeEventHandlers(handleMouseDown, onMouseDownExternal ?? undefined)}
	onpointerdown={composeEventHandlers(handlePointerDown, onPointerDownExternal ?? undefined)}
	onmouseenter={composeEventHandlers(handleMouseEnter, onMouseEnterExternal ?? undefined)}
	onmouseleave={composeEventHandlers(handleMouseLeave, onMouseLeaveExternal ?? undefined)}
	ondragover={composeEventHandlers(handleDragOver, onDragOverExternal ?? undefined)}
	ondragenter={composeEventHandlers(handleDragEnter, onDragEnterExternal ?? undefined)}
	ondragleave={composeEventHandlers(handleDragLeave, onDragLeaveExternal ?? undefined)}
	ondragend={composeEventHandlers(handleDragEnd, onDragEndExternal ?? undefined)}
	ondrop={composeEventHandlers(handleDrop, onDropExternal ?? undefined)}
	onpaste={composeEventHandlers(handlePaste, onPasteExternal ?? undefined)}
>
	{#if children}
		{@render (children as Snippet<[DropzoneRenderState]>)(renderState)}
	{/if}
</button>

<!-- `disabled` is forwarded as defense in depth: the button already guards
     `openPicker`, but a programmatic `.click()` on the input must not open
     the picker for a disabled zone either. -->
<input
	bind:this={inputRef}
	type="file"
	{accept}
	{multiple}
	{disabled}
	tabindex={-1}
	aria-hidden="true"
	style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;"
	onchange={handleInputChange}
/>

<span
	role="status"
	aria-live="polite"
	aria-atomic="true"
	style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;"
	>{announcement}</span
>
