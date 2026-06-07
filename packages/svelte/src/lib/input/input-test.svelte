<script lang="ts">
	import Input from './index';

	type Props = {
		isDisabled?: boolean;
		isReadOnly?: boolean;
		isInvalid?: boolean;
		isRequired?: boolean;
		autofocus?: boolean;
		value?: string;
		onMouseEnter?: (event: MouseEvent) => void;
		onFocus?: (event: FocusEvent) => void;
	};

	let {
		isDisabled = false,
		isReadOnly = false,
		isInvalid = false,
		isRequired = false,
		autofocus = false,
		value = $bindable(''),
		onMouseEnter,
		onFocus
	}: Props = $props();
</script>

<form>
	<button type="button">Before</button>

	<Input
		bind:value
		aria-label="Email"
		placeholder="name@example.com"
		{isDisabled}
		{isReadOnly}
		{isInvalid}
		{isRequired}
		{autofocus}
		onmouseenter={onMouseEnter}
		onfocus={onFocus}
	/>

	<output data-input-value>{value}</output>

	<button type="button">After</button>
</form>
