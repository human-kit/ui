# Dialog Root API Reference

## Section
- Name: `Dialog.Root`
- Description: Estado principal del dialog. Coordina apertura/cierre, referencia de trigger y helpers expuestos a `children`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | `undefined` | Estado controlado de apertura (bindable). |
| `defaultOpen` | `boolean` | `false` | Estado inicial en modo no controlado. |
| `onOpenChange` | `(open: boolean) => void` | `undefined` | Callback al cambiar apertura. |
| `triggerRef` | `HTMLElement | null` | `null` | Referencia al trigger (bindable o auto-seteada por Trigger). |
| `children` | `Snippet<[DialogStateHelpers]>` | `undefined` | Snippet que recibe `{ close, open, toggle, isOpen }`. |

## Section
- Name: `context.ts` utilities
- Description: API para publicar/consumir contexto de dialog entre subcomponentes.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `setDialogContext` | `(ctx: DialogContext) => void` | `-` | Registra contexto en `Dialog.Root`. |
| `getDialogContext` | `() => DialogContext | undefined` | `-` | Obtiene contexto activo si existe. |
| `DialogContext` | `type` | `-` | Incluye estado (`isOpen`, `stackLevel`, `triggerRef`) y acciones (`open`, `close`, `toggle`). |

## Section
- Name: `types.ts` (`DialogStateHelpers`)
- Description: Tipo expuesto al `children` snippet de `Dialog.Root`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `close` | `() => void` | `-` | Cierra el dialog. |
| `open` | `() => void` | `-` | Abre el dialog. |
| `toggle` | `() => void` | `-` | Alterna estado abierto/cerrado. |
| `isOpen` | `boolean` | `-` | Estado actual de apertura. |

## Section
- Name: `dialog-stack.ts` utilities
- Description: Stack global para dialogs anidados. Garantiza z-index incremental y que solo el topmost procese cierre global.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `pushDialog` | `(close: () => void) => { id: symbol; level: number }` | `-` | Registra dialog abierto y devuelve id + nivel de stack. |
| `popDialog` | `(id: symbol) => void` | `-` | Remueve dialog del stack al desmontar/cerrar. |
| `isTopmostDialog` | `(id: symbol) => boolean` | `-` | Informa si el dialog actual es el ultimo del stack. |
| `getOverlayZIndex` | `(level: number) => number` | `BASE + level*10` | Calcula z-index de overlay por nivel. |
| `getContentZIndex` | `(level: number) => number` | `BASE + level*10 + 1` | Calcula z-index de content por nivel. |
| `getDialogCount` | `() => number` | `-` | Devuelve cantidad de dialogs abiertos. |
