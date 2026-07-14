<script lang="ts">
	import Input from './index';

	type Props = {
		disabled?: boolean;
		readonly?: boolean;
		invalid?: boolean;
		required?: boolean;
		autofocus?: boolean;
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
		{disabled}
		{readonly}
		{invalid}
		{required}
		{autofocus}
		onmouseenter={onMouseEnter}
		onfocus={onFocus}
	/>

	<output data-input-value>{value}</output>

	<button type="button">After</button>
</form>
