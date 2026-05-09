<!-- markdownlint-disable MD024 -->

# Tree.Root

## API reference

### Tree.Root

Name: `Tree.Root`
Description: State container for tree focus, expansion, selection, typeahead, and item actions.

| Prop                     | Type                                    | Default     | Description                                                            |
| ------------------------ | --------------------------------------- | ----------- | ---------------------------------------------------------------------- |
| `expandedKeys`           | `Iterable<string \| number>`            | `undefined` | Controlled expanded item ids. Use with `onExpandedKeysChange` or `bind:expandedKeys`. |
| `defaultExpandedKeys`    | `Iterable<string \| number>`            | `undefined` | Initial uncontrolled expanded item ids.                                |
| `selectedKeys`           | `Iterable<string \| number>`            | `undefined` | Controlled selected item ids. Use with `onSelectionChange` or `bind:selectedKeys`. |
| `defaultSelectedKeys`    | `Iterable<string \| number>`            | `undefined` | Initial uncontrolled selected item ids.                                |
| `disabledKeys`           | `Iterable<string \| number>`            | `undefined` | Item ids that should be disabled.                                      |
| `selectionMode`          | `'none' \| 'single' \| 'multiple'`      | `'none'`    | Selection model for the tree.                                          |
| `selectionBehavior`      | `'toggle' \| 'replace'`                 | `'toggle'`  | Multi-selection behavior on press.                                     |
| `disabledBehavior`       | `'selection' \| 'all'`                  | `'all'`     | Whether disabled keys block only selection or all interaction.         |
| `selectionPropagation`   | `'none' \| 'descendants'`               | `'none'`    | Whether selecting a parent propagates through descendants.             |
| `disallowEmptySelection` | `boolean`                               | `false`     | Prevents the selection state from becoming empty.                      |
| `items`                  | `Iterable<T>`                           | `undefined` | Dynamic top-level items.                                               |
| `children`               | `Snippet \| Snippet<[T]>`               | `undefined` | Static composition or dynamic item renderer.                           |
| `renderEmptyState`       | `Snippet<[TreeEmptyStateRenderProps]>`  | `undefined` | Empty tree content when no nodes are available.                        |
| `onExpandedKeysChange`   | `(keys: Set<string \| number>) => void` | `undefined` | Called when expanded state changes.                                    |
| `onSelectionChange`      | `(keys: Set<string \| number>) => void` | `undefined` | Called when selection changes.                                         |
| `onAction`               | `(id: string \| number) => void`        | `undefined` | Called when the focused item is activated with `Enter`.                |
| `aria-label`             | `string`                                | `undefined` | Accessible label for the tree.                                         |
| `aria-labelledby`        | `string`                                | `undefined` | Id reference to an external label.                                     |
| `class`                  | `string`                                | `''`        | CSS class names for the root element.                                  |
| `context`                | `TreeContext`                           | `bindable`  | Exposes the internal tree context for advanced compositions and tests. |
| `element`                | `HTMLElement`                           | `bindable`  | Exposes the rendered root element.                                     |

### Context utilities

Name: `context.ts` helpers
Description: Low-level APIs for reading and publishing tree state.

| Prop                | Type                       | Default | Description                                                      |
| ------------------- | -------------------------- | ------- | ---------------------------------------------------------------- |
| `createTreeContext` | `(options) => TreeContext` | `-`     | Creates the internal tree state contract.                        |
| `setTreeContext`    | `(context) => TreeContext` | `-`     | Publishes context from `Tree.Root`.                              |
| `useTreeContext`    | `() => TreeContext`        | `-`     | Consumes the active tree context and throws outside `Tree.Root`. |
