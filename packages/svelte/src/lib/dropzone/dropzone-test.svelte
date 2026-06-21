<script lang="ts">
	import Dropzone from './index';

	type Props = {
		isDisabled?: boolean;
		accept?: string;
		multiple?: boolean;
		announcement?: string;
		onFilesPicked?: (files: File[]) => void;
	};

	let {
		isDisabled = false,
		accept,
		multiple = false,
		announcement = '',
		onFilesPicked
	}: Props = $props();
</script>

<form>
	<button type="button">Before</button>

	<Dropzone
		aria-label="Attachments"
		{isDisabled}
		{accept}
		{multiple}
		{announcement}
		{onFilesPicked}
	>
		{#snippet children({ isDragging, isFocusVisible })}
			<span data-state-dragging={isDragging}>{isDragging ? 'dragging' : 'idle'}</span>
			<span data-state-focus-visible={isFocusVisible}></span>
		{/snippet}
	</Dropzone>

	<button type="button">After</button>
</form>
