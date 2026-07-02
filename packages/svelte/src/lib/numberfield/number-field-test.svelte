<script lang="ts">
	import { LocaleProvider } from '../locale-provider';
	import { NumberField } from './index';

	type Props = {
		value?: number | null;
		defaultValue?: number | null;
		min?: number;
		max?: number;
		step?: number;
		smallStep?: number;
		largeStep?: number;
		disabled?: boolean;
		readonly?: boolean;
		required?: boolean;
		invalid?: boolean;
		'aria-invalid'?: boolean | 'true' | 'false';
		allowWheelScrub?: boolean;
		allowOutOfRange?: boolean;
		snapOnStep?: boolean;
		formatOptions?: Intl.NumberFormatOptions;
		locale?: string;
		name?: string;
		incrementAriaLabel?: string;
		decrementAriaLabel?: string;
		onChange?: (value: number | null) => void;
	};

	let {
		value = $bindable<number | null | undefined>(undefined),
		defaultValue,
		min,
		max,
		step = 1,
		smallStep = 0.1,
		largeStep = 10,
		disabled = false,
		readonly = false,
		required = false,
		invalid = false,
		'aria-invalid': ariaInvalid,
		allowWheelScrub = false,
		allowOutOfRange = false,
		snapOnStep = false,
		formatOptions,
		locale = 'en-US',
		name,
		incrementAriaLabel,
		decrementAriaLabel,
		onChange
	}: Props = $props();

	let submittedEntries = $state('');

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const form = event.currentTarget;
		if (!(form instanceof HTMLFormElement)) return;
		submittedEntries = JSON.stringify(Object.fromEntries(new FormData(form).entries()));
	}
</script>

<form onsubmit={handleSubmit}>
	<button type="button">Before</button>

	<LocaleProvider {locale}>
		<NumberField.Root
			bind:value
			{defaultValue}
			{min}
			{max}
			{step}
			{smallStep}
			{largeStep}
			{disabled}
			{readonly}
			{required}
			{invalid}
			aria-invalid={ariaInvalid}
			{allowWheelScrub}
			{allowOutOfRange}
			{snapOnStep}
			{formatOptions}
			{name}
			{incrementAriaLabel}
			{decrementAriaLabel}
			{onChange}
			class="number-field-test"
		>
			<NumberField.ScrubArea data-testid="scrub-area">
				Scrub
				<NumberField.ScrubAreaCursor>Cursor</NumberField.ScrubAreaCursor>
			</NumberField.ScrubArea>
			<NumberField.Group>
				<NumberField.Decrement>Decrease</NumberField.Decrement>
				<NumberField.Input aria-label="Amount" />
				<NumberField.Increment>Increase</NumberField.Increment>
			</NumberField.Group>
		</NumberField.Root>
	</LocaleProvider>

	<output data-number-field-value>{JSON.stringify(value)}</output>
	<output data-form-entries>{submittedEntries}</output>
	<button type="submit">Submit</button>
	<button type="button">After</button>
</form>
