import type { ComponentProps } from 'svelte';
import type DropzoneComponent from './dropzone.svelte';
import Dropzone from './dropzone.svelte';

export type DropzoneProps = ComponentProps<typeof DropzoneComponent>;
export type { DropzoneRenderState } from './dropzone.svelte';
export { Dropzone };
export default Dropzone;
