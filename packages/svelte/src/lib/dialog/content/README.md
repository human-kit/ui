# Dialog Content API Reference

## Section
- Name: `Dialog.Content`
- Description: Panel modal centrado. Aplica click outside, focus trap, scroll lock, aria hide outside y control topmost con stack global.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `Snippet` | `undefined` | Contenido interno del dialog. |
| `class` | `string` | `''` | Clases CSS del panel dialog. |
| `shouldCloseOnInteractOutside` | `boolean` | `true` | Cierra al click/interaccion fuera del content (solo si es topmost). |
| `shouldCloseOnEscape` | `boolean` | `true` | Permite cierre con Escape (solo topmost). |
| `...restProps` | `HTMLAttributes<HTMLDivElement>` | `-` | Props HTML extra del contenedor dialog. |
