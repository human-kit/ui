<script lang="ts">
	import Calendar from '../index';
	import type { CalendarValue } from './context';

	let value = $state<CalendarValue>('2026-02-10');
</script>

<Calendar.Root
	{value}
	onChange={(nextValue) => (value = nextValue)}
	aria-label="Controlled clear test calendar"
>
	<Calendar.Grid>
		<Calendar.GridHeader />
		<Calendar.GridBody />
	</Calendar.Grid>
</Calendar.Root>

<button type="button" data-testid="clear-value" onclick={() => (value = '')}>Clear value</button>
<div data-testid="calendar-value">{value}</div>
