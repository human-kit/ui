<script lang="ts">
	import Input from './index';

	type Props = {
		isDisabled?: boolean;
		isReadOnly?: boolean;
		isInvalid?: boolean;
		isRequired?: boolean;
		onMouseEnter?: (event: MouseEvent) => void;
		onFocus?: (event: FocusEvent) => void;
	};

	let {
		isDisabled = false,
		isReadOnly = false,
		isInvalid = false,
		isRequired = false,
		onMouseEnter,
		onFocus
	}: Props = $props();
</script>

<form>
	<button type="button">Before</button>

	<Input
		aria-label="Email"
		placeholder="name@example.com"
		{isDisabled}
		{isReadOnly}
		{isInvalid}
		{isRequired}
		onmouseenter={onMouseEnter}
		onfocus={onFocus}
	/>

	<button type="button">After</button>
</form>
