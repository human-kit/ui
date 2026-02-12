# Dialog

## Description
`Dialog` implementa un modal accesible con trigger, portal, overlay y content, incluyendo stack para dialogs anidados con z-index y manejo topmost.

## Usage Guidelines
- Usa siempre `Dialog.Root` como fuente de estado.
- Renderiza `Dialog.Trigger` para vincular el boton de apertura.
- Renderiza `Dialog.Portal` para aislar overlay/content fuera del flujo normal.
- Combina `Dialog.Overlay` + `Dialog.Content` dentro de `Dialog.Portal`.
- En casos anidados, la libreria maneja stack y solo el dialog topmost responde a Escape/outside click.

## Anatomy
- `Dialog.Root`
- `Dialog.Trigger`
- `Dialog.Portal`
- `Dialog.Overlay`
- `Dialog.Content`

```svelte
<Dialog.Root>
	<Dialog.Trigger>
		<button>Open</button>
	</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Overlay />
		<Dialog.Content>...</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
```
