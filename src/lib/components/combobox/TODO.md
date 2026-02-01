# ComboBox - Code Review & TODOs

Comprehensive review based on: **Accessibility**, **Scalability**, **Performance**, **Svelte 5 Runes Best Practices**.

---

## 🔊 Accesibilidad

### Completado ✅

- [x] ARIA pattern: `aria-activedescendant` para virtual focus
- [x] `aria-expanded`, `aria-haspopup`, `aria-controls` en input
- [x] `aria-label` en ListBox
- [x] `role="combobox"`, `role="listbox"`, `role="option"`
- [x] `aria-selected` en items seleccionados
- [x] `aria-disabled` en items/placeholder deshabilitados
- [x] Input soporta `aria-label` y `aria-labelledby` props
- [x] ListBox tiene ID para que `aria-controls` funcione correctamente
- [x] Button tiene `aria-controls` apuntando al listbox
- [x] Wrapper group soporta `aria-label` y `aria-labelledby`
- [x] Input soporta `aria-describedby` para instrucciones de uso

### Pendiente

- [ ] **Live regions para conteo de resultados**
  - Agregar `<div aria-live="polite">` que anuncie "{N} resultados disponibles" al filtrar
  - Importante para screen readers que no ven el cambio visual

- [ ] **Anuncio de selección**
  - Anunciar "Item seleccionado: {label}" cuando se selecciona
  - Usar `aria-live="assertive"` para cambios importantes

- [ ] **Soporte para grupos (sections)**
  - Implementar `role="group"` con `aria-labelledby` para secciones
  - Agregar `ComboBox.Section` component

---

## 📈 Escalabilidad

### Completado ✅

- [x] Hook `useVirtualFocus` reutilizable
- [x] Controlled/uncontrolled mode
- [x] Filtrado automático en items
- [x] `emptyPlaceholder` reactivo

### Pendiente

- [ ] **`filterFn` prop customizable**
  - Actualmente filtrado es case-insensitive includes
  - Permitir: fuzzy search, startsWith, exact match, async search

- [ ] **`allowCreate` prop**
  - Permitir crear nuevos items cuando no hay match
  - Callback `onCreate?: (value: string) => void`

- [x] **Multiple selection UI**
  - Chips/tags para items seleccionados ✅ `ComboBox.Tags`, `ComboBox.Tag`, `ComboBox.TagRemove`
  - Clear all button (disponible via `clearSelection()` en context)
  - Contador de seleccionados (disponible via `selectedValue.size`)
  - Navegación de tags con teclado (ArrowLeft/Right, Delete/Backspace)
  - `ComboBox.ItemIndicator` para mostrar checks en items seleccionados

- [ ] **Form integration**
  - `name` prop para `<form>` nativo
  - Hidden input con valor serializado
  - Validación con `required`, `aria-invalid`

- [ ] **Async data support**
  - Props: `isLoading`, `loadingPlaceholder`
  - Callback: `onLoadMore` para infinite scroll
  - Debounce integrado para búsqueda async

- [ ] **Virtualization**
  - Para listas grandes (>100 items)
  - Integrar con `@tanstack/virtual` o similar

---

## ⚡ Performance

### Completado ✅

- [x] Cache de DOM queries con invalidación (`cachedItemOrder`)
- [x] `untrack()` para evitar loops infinitos en effects
- [x] Subscription pattern para `itemCount` reactivo
- [x] Scoped queries via `containerRef`

### Pendiente

- [ ] **Memoización de `isVisible` en ListBoxItem**
  - Actualmente se recalcula en cada render
  - Considerar memoizar con `$derived` más granular

- [ ] **Batch registration**
  - `registerItem` se llama por cada item individualmente
  - Para listas grandes, batch notifications

- [ ] **Lazy itemLabels**
  - El Map `itemLabels` crece con cada item
  - Limpiar en unmount está implementado, pero considerar WeakMap

- [ ] **Effect cleanup optimizations**
  - Revisar effects que podrían consolidarse
  - `combobox-listboxitem.svelte` tiene 2 effects que podrían ser 1

---

## 🔧 Svelte 5 Runes Best Practices

### Completado ✅

- [x] `$state` para estado reactivo
- [x] `$derived` para valores computados
- [x] `$effect` con cleanup functions
- [x] `$bindable` para two-way binding
- [x] `$props()` para destructuring
- [x] `untrack()` para evitar re-runs innecesarios
- [x] `$derived(expression)` en vez de `$derived(() => ...)` - Simplificado en `combobox-listboxitem.svelte`
- [x] Effects consolidados - Usando 1 `$effect` + `onDestroy` en vez de 2 effects

### Revisado - No requiere cambios

- [x] **`$effect.pre`**: Revisado - no hay race conditions que lo requieran
- [x] **Context typing**: El type único es apropiado - tree-shaking no aplica a context objects

---

## 🧪 Testing

### Completado ✅

- [x] 291 tests unitarios pasando
- [x] Keyboard navigation tests
- [x] Selection tests
- [x] Filtering tests
- [x] Empty placeholder tests
- [x] ARIA accessibility tests (6 tests)
- [x] Edge cases: rapid typing, whitespace, backspace
- [x] Disabled/ReadOnly state tests
- [x] Trigger modes (focus, input, manual)
- [x] Selection behavior (Enter, click, Escape restoration)
- [x] Multi-select tests (12 tests)
- [x] Tags component tests (4 tests)
- [x] Tag component tests (13 tests) - incluye navegación por teclado
- [x] TagRemove component tests (6 tests)
- [x] ItemIndicator component tests (5 tests)

### Pendiente

- [ ] **Tests con muchos items (100+)** - performance tests
- [ ] **Visual regression tests** - screenshots de estados

---

## 📝 Documentación

- [ ] **JSDoc completo**
  - Documentar todas las props públicas
  - Ejemplos de uso en comments

- [ ] **Storybook/Demo page**
  - Ejemplos interactivos de todos los casos de uso
  - Estados: loading, error, disabled, readonly

---

## 🎯 Próximos Pasos Priorizados

1. **Live regions** (accessibility - alto impacto)
2. **Form integration** (usabilidad - casos comunes)
3. **`filterFn` customizable** (escalabilidad)
4. **Consolidar effects** (performance/best practices)
5. **Async data support** (escalabilidad)
