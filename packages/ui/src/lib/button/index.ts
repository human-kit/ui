import type { ComponentProps } from 'svelte';
import type ButtonRootComponent from './root/button-root.svelte';

export * as Button from './index.parts.js';

export { default as ButtonRoot } from './root/button-root.svelte';
export type { ButtonRenderState } from './root/button-root.svelte';
export type ButtonRootProps = ComponentProps<typeof ButtonRootComponent>;

import * as ButtonParts from './index.parts.js';
export default ButtonParts;
