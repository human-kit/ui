# Popover Trigger API Reference

## Section
- Name: `Popover.Trigger`
- Description: Wrapper que detecta un boton en `children`, lo conecta como trigger y maneja toggle via click.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `Snippet` | `undefined` | Contenido que incluye el elemento trigger real (`button` o `[role="button"]`). |

## Section
- Name: `Popover.TriggerButton`
- Description: Boton trigger ya integrado con contexto de popover.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `Snippet` | `undefined` | Contenido interno del boton. |
| `class` | `string` | `''` | Clases CSS del boton. |
| `...restProps` | `Record<string, unknown>` | `-` | Props adicionales reenviadas al `<button>`. |
