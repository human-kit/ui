# ListBox

## Description
`ListBox` maneja seleccion de opciones (single o multiple), foco y navegacion por teclado con soporte para render estatico o dinamico.

## Usage Guidelines
- Usa `ListBox.Root` para definir modo de seleccion y colecciones.
- Usa `ListBox.Item` para cada opcion seleccionable.
- Si controlas el estado externamente, usa `value` y escucha `onChange`.
- Usa `disabledIds` o `disabled` por item para bloquear interaccion.
- Provee `aria-label` cuando no exista label visible asociado.

## Anatomy
- `ListBox.Root`
- `ListBox.Item`

```svelte
<ListBox.Root aria-label="Options">
	<ListBox.Item id="1">Option 1</ListBox.Item>
</ListBox.Root>
```
