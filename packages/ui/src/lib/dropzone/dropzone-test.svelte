<script lang="ts">
	import Dropzone from './index';

	type Props = {
		disabled?: boolean;
		accept?: string;
		multiple?: boolean;
		announcement?: string;
		onFilesPicked?: (files: File[]) => void;
		onFilesRejected?: (files: File[]) => void;
		onClick?: (event: MouseEvent) => void;
	};

	let {
		disabled = false,
		accept,
		multiple = false,
		announcement = '',
		onFilesPicked,
		onFilesRejected,
		onClick
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
		{onFilesRejected}
		onclick={onClick}
	>
		{#snippet children({ dragging, hovered, focusVisible })}
			<span data-state-dragging={dragging}>{dragging ? 'dragging' : 'idle'}</span>
			<span data-state-hovered={hovered}></span>
			<span data-state-focus-visible={focusVisible}></span>
		{/snippet}
	</Dropzone>

	<button type="button">After</button>
</form>
