import type { ComponentProps } from 'svelte';
import type SwitchRootComponent from './root/switch-root.svelte';
import type SwitchThumbComponent from './thumb/switch-thumb.svelte';

export * as Switch from './index.parts.js';

export { default as SwitchRoot } from './root/switch-root.svelte';
export { default as SwitchThumb } from './thumb/switch-thumb.svelte';
export type SwitchRootProps = ComponentProps<typeof SwitchRootComponent>;
export type SwitchThumbProps = ComponentProps<typeof SwitchThumbComponent>;

export {
	getSwitchContext,
	setSwitchContext,
	useSwitchContext,
	type SwitchContext
} from './root/context.js';

import * as SwitchParts from './index.parts.js';
export default SwitchParts;
