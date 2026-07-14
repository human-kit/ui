<script lang="ts">
	import { LocaleProvider } from '../index';
	import Calendar from '../calendar';

	type Props = {
		locale?: string;
	};

	let { locale = 'es-ES' }: Props = $props();
</script>

<LocaleProvider {locale}>
	<Calendar.Root defaultValue="2026-02-10" aria-label="Locale provider test calendar">
		<Calendar.Heading />
		<Calendar.Grid>
			<Calendar.GridHeader />
			<Calendar.GridBody />
		</Calendar.Grid>
	</Calendar.Root>
</LocaleProvider>
