<script lang="ts">
	import Calendar from '../index';

	let value = $state('2026-02-10');
</script>

<Calendar.Root
	selectionMode="single"
	{value}
	onChange={(nextValue: string) => (value = nextValue)}
	aria-label="Controlled clear test calendar"
>
	<Calendar.Grid>
		<Calendar.GridHeader />
		<Calendar.GridBody />
	</Calendar.Grid>
</Calendar.Root>

<button type="button" data-testid="clear-value" onclick={() => (value = '')}>Clear value</button>
<div data-testid="calendar-value">{value}</div>
