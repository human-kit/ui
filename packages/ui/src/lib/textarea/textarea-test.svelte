<script lang="ts">
	import TextArea from './index';

	type Props = {
		disabled?: boolean;
		readonly?: boolean;
		invalid?: boolean;
		required?: boolean;
		autofocus?: boolean;
		autoResize?: boolean;
		minRows?: number;
		maxRows?: number;
		value?: string;
		onMouseEnter?: (event: MouseEvent) => void;
		onFocus?: (event: FocusEvent) => void;
	};

	let {
		disabled = false,
		readonly = false,
		invalid = false,
		required = false,
		autofocus = false,
		autoResize = false,
		minRows,
		maxRows,
		value = $bindable(''),
		onMouseEnter,
		onFocus
	}: Props = $props();
</script>

<form>
	<button type="button">Before</button>

	<TextArea
		bind:value
		aria-label="Message"
		placeholder="Write a message"
		{disabled}
		{readonly}
		{invalid}
		{required}
		{autofocus}
		{autoResize}
		{minRows}
		{maxRows}
		onmouseenter={onMouseEnter}
		onfocus={onFocus}
	/>

	<output data-textarea-value>{value}</output>

	<button type="button">After</button>
</form>
