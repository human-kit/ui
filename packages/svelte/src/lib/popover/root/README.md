# Popover Root API Reference

## Section
- Name: `Popover.Root`
- Description: Estado principal del popover; sincroniza apertura, toggle y referencia del trigger para sus hijos.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | `undefined` | Estado controlado de apertura (bindable). |
| `defaultOpen` | `boolean` | `false` | Estado inicial en modo no controlado. |
| `onOpenChange` | `(open: boolean) => void` | `undefined` | Callback al cambiar apertura. |
| `triggerRef` | `HTMLElement | null` | `null` | Referencia al trigger (bindable o auto-seteada por Trigger). |
| `children` | `Snippet` | `undefined` | Arbol de `Trigger` y `Content`. |

## Section
- Name: `context.ts` utilities
- Description: Helpers para registrar/leer contexto compartido de popover.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `setPopoverContext` | `(ctx: PopoverContext) => void` | `-` | Registra el contexto dentro de `Popover.Root`. |
| `getPopoverContext` | `() => PopoverContext | undefined` | `-` | Obtiene contexto si existe. |
| `PopoverContext` | `type` | `-` | Contrato de estado (`isOpen`, `triggerRef`) y acciones (`open`, `close`, `toggle`). |
| `PopoverTriggerContext` | `type alias` | `PopoverContext` | Alias legacy para compatibilidad. |
| `setPopoverTriggerContext` | `alias` | `setPopoverContext` | Alias legacy de set context. |
| `getPopoverTriggerContext` | `alias` | `getPopoverContext` | Alias legacy de get context. |
