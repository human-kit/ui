<script lang="ts">
	import { LocaleProvider } from '../locale-provider';
	import { SearchField } from './index';

	type Props = {
		value?: string;
		defaultValue?: string;
		disabled?: boolean;
		readonly?: boolean;
		required?: boolean;
		invalid?: boolean;
		name?: string;
		locale?: string;
		clearLabel?: string;
		onChange?: (value: string) => void;
		onSubmit?: (value: string) => void;
		onClear?: () => void;
		onOuterKeyDown?: (event: KeyboardEvent) => void;
	};

	let {
		value = $bindable<string | undefined>(undefined),
		defaultValue,
		disabled = false,
		readonly = false,
		required = false,
		invalid = false,
		name,
		locale = 'en-US',
		clearLabel,
		onChange,
		onSubmit,
		onClear,
		onOuterKeyDown
	}: Props = $props();

	let submittedEntries = $state('');

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const form = event.currentTarget;
		if (!(form instanceof HTMLFormElement)) return;
		submittedEntries = JSON.stringify(Object.fromEntries(new FormData(form).entries()));
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div onkeydown={onOuterKeyDown}>
	<form onsubmit={handleSubmit}>
		<button type="button">Before</button>

		<LocaleProvider {locale}>
			<SearchField.Root
				bind:value
				{defaultValue}
				{disabled}
				{readonly}
				{required}
				{invalid}
				{name}
				{onChange}
				{onSubmit}
				{onClear}
				data-testid="root"
			>
				<SearchField.Label data-testid="label">Search</SearchField.Label>
				<SearchField.Input />
				<SearchField.Clear aria-label={clearLabel} />
			</SearchField.Root>
		</LocaleProvider>

		<output data-search-field-value>{JSON.stringify(value)}</output>
		<output data-form-entries>{submittedEntries}</output>
		<button type="submit">Submit</button>
		<button type="reset">Reset</button>
		<button type="button" onclick={() => (value = 'set by parent')}>Set value</button>
	</form>
</div>
