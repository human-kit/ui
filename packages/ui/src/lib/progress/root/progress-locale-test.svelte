<script lang="ts">
	import { LocaleProvider } from '../../index';
	import { Progress } from '../index';

	type Props = {
		locale?: string;
		value?: number | null;
	};

	let { locale = 'de-DE', value = 31 }: Props = $props();
</script>

<LocaleProvider {locale}>
	<Progress.Root {value} aria-label="Export" data-testid="progress">
		<Progress.Value data-testid="value" />
	</Progress.Root>
</LocaleProvider>
