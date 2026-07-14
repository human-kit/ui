import type { ComponentProps } from 'svelte';
import type TextAreaComponent from './textarea.svelte';
import TextArea from './textarea.svelte';

export type TextAreaProps = ComponentProps<typeof TextAreaComponent>;
export { TextArea };
export default TextArea;
