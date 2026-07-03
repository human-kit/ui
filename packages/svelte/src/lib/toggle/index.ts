import type { ComponentProps } from 'svelte';
import type ToggleRootComponent from './root/toggle-root.svelte';

export * as Toggle from './index.parts.js';

export { default as ToggleRoot } from './root/toggle-root.svelte';
export type { ToggleRenderState } from './root/toggle-root.svelte';
export type ToggleRootProps = ComponentProps<typeof ToggleRootComponent>;

import * as ToggleParts from './index.parts.js';
export default ToggleParts;
