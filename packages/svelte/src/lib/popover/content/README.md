# Popover Content API Reference

## Section
- Name: `Popover.Content`
- Description: Panel flotante del popover. Puede funcionar con contexto (`Popover.Root`) o en modo standalone controlado por props.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `offset` | `number` | `8` | Separacion sobre el eje principal respecto al anchor. |
| `placement` | `ExtendedPlacement` | `'bottom'` | Posicion preferida del panel flotante. |
| `shouldFlip` | `boolean` | `true` | Permite flip automatico cuando falta espacio. |
| `boundaryElement` | `Element | null` | `null` | Limite de colision para posicionamiento. |
| `children` | `Snippet` | `undefined` | Contenido del panel. |
| `class` | `string` | `''` | Clases CSS del contenedor flotante. |
| `isNonModal` | `boolean` | `false` | Si es `true`, no aplica focus trap/scroll lock/aria hide outside. |
| `shouldCloseOnInteractOutside` | `boolean` | `true` | Cierra al interactuar fuera del panel. |
| `shouldCloseOnEscape` | `boolean` | `true` | Cierra al presionar Escape. |
| `shouldCloseOnBlur` | `boolean` | `undefined` | Si no se define, usa `true` cuando `isNonModal=true`. |
| `open` | `boolean` | `undefined` | Estado abierto en modo standalone. |
| `triggerRef` | `HTMLElement | null` | `null` | Referencia al trigger en modo standalone. |
| `onOpenChange` | `(open: boolean) => void` | `undefined` | Callback de apertura en modo standalone. |
| `...restProps` | `HTMLAttributes<HTMLDivElement>` | `-` | Props HTML extra del panel. |
