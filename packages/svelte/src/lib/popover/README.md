# Popover

## Description
`Popover` renderiza contenido flotante anclado a un trigger, con soporte modal/no-modal, cierre por outside interaction y posicionamiento con floating.

## Usage Guidelines
- Usa `Popover.Root` para estado compartido entre trigger y content.
- Usa `Popover.Trigger` cuando quieras auto-vincular un boton existente en children.
- Usa `Popover.TriggerButton` cuando prefieras un boton listo para usar.
- Usa `Popover.Content` en modo contexto (dentro de Root) o standalone (pasando `open`, `triggerRef`, `onOpenChange`).
- Ajusta `isNonModal`, `shouldCloseOnInteractOutside` y `shouldCloseOnBlur` segun comportamiento esperado.

## Anatomy
- `Popover.Root`
- `Popover.Trigger` o `Popover.TriggerButton`
- `Popover.Content`

```svelte
<Popover.Root>
	<Popover.Trigger>
		<button>Open</button>
	</Popover.Trigger>
	<Popover.Content>
		<div>Panel</div>
	</Popover.Content>
</Popover.Root>
```
