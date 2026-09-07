export { default as Root } from './root/toggle-group-root.svelte';
// `Item` is `Toggle.Root` under the namespace of the group. A toggle works on its own, so it keeps
// its own name; this only gives every group in the library the same shape — `Group.Root` with
// `Group.Item` inside.
export { default as Item } from '../toggle/root/toggle-root.svelte';
