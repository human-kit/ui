# Dropzone

## Description

`Dropzone` is a headless file-drop surface. It renders a focusable `<button>` plus a
visually-hidden `<input type="file">`, so files can be selected by click/keyboard, by
drag-and-drop, or by pasting from the clipboard, and emits the accepted native `File`s.
It is encoding-agnostic — consumers own how files are stored or rendered.

## Anatomy

- `Dropzone`

```svelte
<Dropzone
	accept=".pdf,image/*"
	multiple
	onFilesPicked={(files) => upload(files)}
	class="rounded-md border border-dashed data-[drop-target]:border-primary"
>
	{#snippet children({ dragging })}
		{dragging ? 'Soltá los archivos' : 'Hacé clic o arrastrá archivos acá'}
	{/snippet}
</Dropzone>
```

## Usage guidelines

- Read picked files from `onFilesPicked: (files: File[]) => void`. It fires for the file
  picker, a drop, and a clipboard paste while the zone is focused, after filtering by `accept`.
- `accept` is forwarded to the native input and also filters dropped/pasted files (the native
  picker cannot enforce `accept` on drop). Files with an empty MIME type only match extension
  tokens (`.ext`), so include the extensions you care about alongside MIME types.
- Directory drops are excluded when the browser exposes `webkitGetAsEntry`; otherwise the
  drop falls back to `dataTransfer.files` as before.
- `multiple` allows selecting/dropping more than one file; when false only the first is emitted.
- Style interaction state with `data-drop-target`, `data-focus-visible`, `data-hovered`, and
  `data-disabled`. The `children` snippet also receives `{ dragging, hovered, focused,
focusVisible, disabled }`.
- Feed `announcement` with a short result message (e.g. `"2 archivos agregados"`) so screen
  reader users hear the outcome of a drop, which does not move focus on its own.

## API reference

`Dropzone` supports:

- `disabled?: boolean`
- `accept?: string`
- `multiple?: boolean`
- `onFilesPicked?: (files: File[]) => void`
- `announcement?: string`
- `element?: HTMLButtonElement | null`
- `children?: Snippet<[DropzoneRenderState]>`
- `...restProps: HTMLButtonAttributes`

## Accessibility

- The drop surface is a native `<button type="button">`, so it is reachable by Tab and
  activatable with Enter/Space, which opens the file picker. This is the keyboard path that
  drag-and-drop alone cannot provide.
- `aria-label` (or `aria-labelledby`/`aria-describedby` via rest props) names the zone.
- `data-focus-visible` follows the shared modality contract and only appears for keyboard or
  virtual focus.
- `announcement` is rendered into a visually-hidden `role="status" aria-live="polite"` region.
- The hidden file input is removed from the tab order (`tabindex="-1"`, `aria-hidden`) so the
  button is the single focus stop.
