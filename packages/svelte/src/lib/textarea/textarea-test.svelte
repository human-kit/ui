<script lang="ts">
	import TextArea from './index';

	type Props = {
		isDisabled?: boolean;
		isReadOnly?: boolean;
		isInvalid?: boolean;
		isRequired?: boolean;
		autoResize?: boolean;
		minRows?: number;
		maxRows?: number;
		value?: string;
		onMouseEnter?: (event: MouseEvent) => void;
		onFocus?: (event: FocusEvent) => void;
	};

	let {
		isDisabled = false,
		isReadOnly = false,
		isInvalid = false,
		isRequired = false,
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
		{isDisabled}
		{isReadOnly}
		{isInvalid}
		{isRequired}
		{autoResize}
		{minRows}
		{maxRows}
		onmouseenter={onMouseEnter}
		onfocus={onFocus}
	/>

	<output data-textarea-value>{value}</output>

	<button type="button">After</button>
</form>
