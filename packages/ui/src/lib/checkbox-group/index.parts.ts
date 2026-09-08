export { default as Root } from './root/checkbox-group-root.svelte';
export { default as Label } from './label/checkbox-group-label.svelte';
// `Item` and `Indicator` are `Checkbox.Root` and `Checkbox.Indicator` under the namespace of the
// group. A checkbox works on its own, so it keeps its own name; this pair only gives every group
// in the library the same shape — `Group.Root` with `Group.Item` inside.
export { default as Item } from '../checkbox/root/checkbox-root.svelte';
export { default as Indicator } from '../checkbox/indicator/checkbox-indicator.svelte';
