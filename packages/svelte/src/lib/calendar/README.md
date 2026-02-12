# Calendar

## Description

`Calendar` provee seleccion de fecha unica (ISO `YYYY-MM-DD`) con navegacion por teclado, soporte controlado/no-controlado y composicion por partes.

## Usage Guidelines

- Usa `Calendar.Root` como contenedor principal.
- `selectionMode` soporta `'single'` (default) o `'range'`.
- En modo controlado, usa `value` + `onChange`; para no-controlado, usa `defaultValue`.
- En `single`, `value/defaultValue` es `YYYY-MM-DD`.
- En `range`, `value/defaultValue` es `{ start?: 'YYYY-MM-DD', end?: 'YYYY-MM-DD' }`.
- `visibleMonths` define cuantos meses se muestran y la paginacion de triggers.
- `isDateUnavailable` deshabilita dias concretos (no foco y no seleccion).
- Usa `LocaleProvider` para adaptar nombres de mes/dia y primer dia de semana.
- Teclado: `Arrow` mueve foco por dias/semanas y `Home/End` al inicio/fin del mes.

## Accessibility

- Cada `grid` publica nombre accesible con el heading del mes visible.
- La fecha de hoy expone `aria-current="date"`.
- Celdas unavailable exponen `aria-disabled="true"`, no se enfocan y no se seleccionan.

### Keyboard

- `ArrowRight/ArrowLeft`: mueve foco +/- 1 dia.
- `ArrowDown/ArrowUp`: mueve foco +/- 7 dias.
- `Home/End`: mueve foco al primer/ultimo dia del mes.
- `PageUp/PageDown`: cambia al mes anterior/siguiente intentando mantener el dia.
- `Enter` o `Space`: selecciona la fecha enfocada (si es seleccionable).
- En `selectionMode="range"`, `Shift + Arrow/Page/Home/End` extiende el rango en preview.
- En `selectionMode="range"`, `Enter` o `Space` confirma el preview si hay rango pendiente.

## Internal Notes

- `PageUp/PageDown` mantiene la implementacion actual: intenta conservar el dia al cambiar de mes, pero si ese dia no es focusable (por ejemplo `isDateUnavailable`), mueve al siguiente dia focusable en la direccion de la tecla. Debido a eso, en escenarios con dias bloqueados puede verse un "desfase" acumulado del numero de dia entre saltos consecutivos.
- En `selectionMode="range"`, el primer click inicia rango (`start`) y el segundo click confirma (`end`), con normalizacion automatica si el usuario elige primero una fecha posterior.
- En `selectionMode="range"`, el hover muestra preview en tiempo real antes de confirmar.

## Anatomy

- `Calendar.Root`
- `Calendar.TriggerPrevious`
- `Calendar.Heading`
- `Calendar.TriggerNext`
- `Calendar.Grid`
- `Calendar.GridHeader`
- `Calendar.HeaderCell`
- `Calendar.GridBody`
- `Calendar.BodyCell`

```svelte
<LocaleProvider locale="es-ES">
  <Calendar.Root>
    <Calendar.TriggerPrevious />
    <Calendar.Heading />
    <Calendar.TriggerNext />
    <Calendar.Grid>
      <Calendar.GridHeader />
      <Calendar.GridBody />
    </Calendar.Grid>
  </Calendar.Root>
</LocaleProvider>
```
