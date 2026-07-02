<script lang="ts">
	import Dropzone from './index';

	type Props = {
		disabled?: boolean;
		accept?: string;
		multiple?: boolean;
		announcement?: string;
		onFilesPicked?: (files: File[]) => void;
	};

	let {
		disabled = false,
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
		{disabled}
		{accept}
		{multiple}
		{announcement}
		{onFilesPicked}
	>
		{#snippet children({ dragging, focusVisible })}
			<span data-state-dragging={dragging}>{dragging ? 'dragging' : 'idle'}</span>
			<span data-state-focus-visible={focusVisible}></span>
		{/snippet}
	</Dropzone>

	<button type="button">After</button>
</form>
