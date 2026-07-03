import type { ComponentProps } from 'svelte';
import type LabelComponent from './label.svelte';
import Label from './label.svelte';

export type LabelProps = ComponentProps<typeof LabelComponent>;
export { Label };
export default Label;
