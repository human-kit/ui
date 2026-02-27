# DatePicker TODO

## Objetivo

Backlog priorizado para cerrar gaps de DatePicker detectados en la auditoria tecnica.

## Bugs

### P0

- [x] Corregir contrato en docs para `value`/`onChange` nullable.
- [x] Adoptar contrato null-first (`null` como estado vacio por defecto).

### P1

- [x] Agregar nombre accesible explicito al dialog del calendario (`aria-label` o `aria-labelledby`).
- [x] Reemplazar resolucion de foco inicial con selector global por foco scoped al popover actual.
- [x] Agregar cobertura de tests en modo disabled (`root`, `input`, `trigger`, `segment`).
- [x] Corregir cancelacion real de `onOpenChange` (encadenada con Popover).

## Improvements

### P2

- [x] Agregar tests de contrato ARIA (`aria-valuenow`, `aria-valuetext`, naming del dialog).
- [x] Cachear `Intl.DateTimeFormat` por locale en utilidades de DatePicker.
- [x] Reducir `querySelectorAll` frecuentes en rutas de foco/teclado.
- [x] Exponer details/reason en `onOpenChange` de DatePicker (alineado con Popover).
- [x] Exponer `data-invalid`/`aria-invalid` para draft no committeable.
- [x] Endurecer encapsulacion de `DatePicker.Calendar` y `DatePicker.Popover` (type + runtime guards).
- [x] Eliminar flakiness de tests por dependencia de orden/estado previo.

## Features

### P3

- [x] Refactor modular de `date-picker-root` (state orchestration separada en modulos).
- [ ] Extender API para reglas de unavailability custom (mas alla de `minValue`/`maxValue`).

## Orden sugerido

1. Resolver todos los Bugs (P0/P1).
2. Ejecutar Improvements (P2).
3. Planificar e implementar Features (P3).
