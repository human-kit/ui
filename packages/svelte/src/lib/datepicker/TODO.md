# DatePicker TODO

## Objetivo

Backlog priorizado para cerrar gaps de DatePicker detectados en la auditoría técnica.

## Bugs

### P0

- [x] Corregir contrato en docs para `value`/`onChange` nullable (alinear README con implementación real).

### P1

- [x] Agregar nombre accesible explícito al dialog del calendario (`aria-label` o `aria-labelledby`).
- [x] Reemplazar resolución de foco inicial con selector global por foco scoped al popover actual.
- [x] Agregar cobertura de tests en modo disabled (`root`, `input`, `trigger`, `segment`).

## Improvements

### P2

- [x] Agregar tests de contrato ARIA (`aria-valuenow`, `aria-valuetext`, naming del dialog).
- [x] Cachear `Intl.DateTimeFormat` por locale en utilidades de DatePicker.
- [x] Reducir `querySelectorAll` frecuentes en rutas de foco/teclado.
- [x] Exponer details/reason en `onOpenChange` de DatePicker (alineado con Popover).

## Features

### P3

- [x] Refactor modular de `date-picker-root` (separar parsing, focus manager y state orchestration).
- [ ] Extender API para reglas de unavailability custom (más allá de `minValue`/`maxValue`).

## Orden sugerido

1. Resolver todos los Bugs (P0/P1).
2. Ejecutar Improvements (P2).
3. Planificar e implementar Features (P3).
