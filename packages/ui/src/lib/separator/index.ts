import type { ComponentProps } from 'svelte';
import type SeparatorComponent from './separator.svelte';
import Separator from './separator.svelte';

export type SeparatorProps = ComponentProps<typeof SeparatorComponent>;
export type { SeparatorOrientation } from './types.js';
export { Separator };
export default Separator;
