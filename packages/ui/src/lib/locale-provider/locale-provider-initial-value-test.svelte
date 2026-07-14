<script lang="ts">
	import { LocaleProvider } from '../index';
	import LocaleProviderValueProbe from './locale-provider-value-probe.svelte';

	type Props = {
		locale?: string;
		onValue?: (value: string | undefined) => void;
	};

	let { locale = 'es-ES', onValue }: Props = $props();
</script>

<LocaleProvider {locale}>
	<LocaleProviderValueProbe {onValue} />
</LocaleProvider>
