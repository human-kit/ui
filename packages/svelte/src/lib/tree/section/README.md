<!-- markdownlint-disable MD024 -->

# Tree.Section

## API reference

### Tree.Section

Name: `Tree.Section`
Description: Semantic grouping container for top-level tree branches, optionally labeled by `Tree.Header`.

| Prop         | Type                      | Default     | Description                                                 |
| ------------ | ------------------------- | ----------- | ----------------------------------------------------------- |
| `id`         | `string \| number`        | generated   | Stable section id used internally by the tree registry.     |
| `value`      | `T`                       | `undefined` | Optional object represented by the section.                 |
| `items`      | `Iterable<T>`             | `undefined` | Dynamic top-level items for this section.                   |
| `children`   | `Snippet \| Snippet<[T]>` | `undefined` | Static child parts or a dynamic item renderer.              |
| `aria-label` | `string`                  | `undefined` | Accessible section label when no `Tree.Header` is rendered. |
| `class`      | `string`                  | `''`        | CSS class names for the section wrapper.                    |

### Context utilities

Name: `setTreeLevelContext`
Description: Internal helper used by `Tree.Section` to seed descendant level and section metadata.

| Prop                  | Type                            | Default | Description                                                          |
| --------------------- | ------------------------------- | ------- | -------------------------------------------------------------------- |
| `setTreeLevelContext` | `(context) => TreeLevelContext` | `-`     | Publishes `parentId`, `sectionId`, and `level` for descendant items. |
