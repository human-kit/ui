# ComboBox

## Description
`ComboBox` combina input, popover y listbox para seleccion simple o multiple con filtrado, navegacion por teclado y soporte controlado/no-controlado.

## Usage Guidelines
- Usa `ComboBox.Root` como contenedor principal de todas las piezas.
- Para modo controlado, maneja `value`, `inputValue` e `isOpen` junto con `onChange`, `onInputChange` y `onOpenChange`.
- Define un `id` estable cuando renderizas con SSR para ids ARIA consistentes.
- En seleccion multiple, renderiza `ComboBox.Tags`, `ComboBox.Tag` y `ComboBox.TagRemove` para feedback y borrado de seleccion.
- Elige `trigger="focus" | "input" | "press"` segun UX esperada de apertura.

## Anatomy
- `ComboBox.Root`
- `ComboBox.Input`
- `ComboBox.Button` (opcional)
- `ComboBox.Popover`
- `ComboBox.List`
- `ComboBox.Item`
- `ComboBox.ItemIndicator` (opcional)
- `ComboBox.Tags` / `ComboBox.Tag` / `ComboBox.TagRemove` (modo multiple)

```svelte
<ComboBox.Root>
	<ComboBox.Input />
	<ComboBox.Button />
	<ComboBox.Popover>
		<ComboBox.List>
			<ComboBox.Item id="1">Option 1</ComboBox.Item>
		</ComboBox.List>
	</ComboBox.Popover>
</ComboBox.Root>
```
