# ComboBox Button API Reference

## Section
- Name: `ComboBox.Button`
- Description: Boton opcional para abrir/cerrar el popover del combobox sin mover foco del input.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `class` | `string` | `undefined` | Clases CSS del boton. |
| `children` | `Snippet` | `undefined` | Contenido custom del boton. Si no se pasa, renderiza icono chevron. |
| `tabindex` | `number` | `-1` | Indice de tabulacion del boton. |
| `...restProps` | `HTMLButtonAttributes` | `-` | Props HTML adicionales reenviadas al `<button>`. |
