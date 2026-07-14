<script lang="ts">
	import Calendar from '../index';

	let value = $state('');
</script>

<Calendar.Root bind:value defaultValue="2026-02-10" aria-label="Bind value test calendar">
	<Calendar.Grid>
		<Calendar.GridHeader />
		<Calendar.GridBody />
	</Calendar.Grid>
</Calendar.Root>

<div data-testid="calendar-value">{value}</div>
