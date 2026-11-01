<script lang="ts">
	import { Autocomplete } from '../autocomplete';
	import { Input } from '../input';
	import { NumberField } from '../numberfield';
	import { SearchField } from '../search-field';
	import { TextArea } from '../textarea';

	// One field per way of owning a value: written one way and heard through `oninput`, and
	// bound, for each component whose element a person types into.
	let heard = $state('');
	let bound = $state('');
	let notes = $state('');
	let query = $state('');
	let amount = $state<number | null>(null);
	let search = $state('');
	let formHeard = $state('');
</script>

<form oninput={(event) => (formHeard = (event.target as HTMLInputElement).name)}>
	<Input
		aria-label="Heard"
		name="heard"
		value={heard}
		oninput={(event) => (heard = event.currentTarget.value)}
	/>
	<Input aria-label="Bound" bind:value={bound} />
	<TextArea aria-label="Notes" bind:value={notes} />
	<SearchField.Root bind:value={query}>
		<SearchField.Input aria-label="Query" />
	</SearchField.Root>
	<NumberField.Root bind:value={amount}>
		<NumberField.Input aria-label="Amount" />
	</NumberField.Root>
	<Autocomplete.Root bind:inputValue={search} aria-label="Fruit">
		<Autocomplete.Input aria-label="Fruit" />
	</Autocomplete.Root>
</form>

<output data-testid="state"
	>{JSON.stringify({ heard, bound, notes, query, amount, search, formHeard })}</output
>
