import type { ComponentProps } from 'svelte';
import type PortalComponent from './portal.svelte';

export { default as Portal } from './portal.svelte';
export type PortalProps = ComponentProps<typeof PortalComponent>;
