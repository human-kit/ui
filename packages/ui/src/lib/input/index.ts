import type { ComponentProps } from 'svelte';
import type InputComponent from './input.svelte';
import Input from './input.svelte';

export type InputProps = ComponentProps<typeof InputComponent>;
export { Input };
export default Input;
