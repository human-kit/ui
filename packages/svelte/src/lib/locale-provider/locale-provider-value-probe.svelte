<script lang="ts">
	import { useLocaleContext } from './context';

	type Props = {
		onValue?: (value: string | undefined) => void;
	};

	let { onValue }: Props = $props();

	const { locale } = useLocaleContext();
	const unsubscribe = locale.subscribe((value) => {
		onValue?.(value);
	});

	$effect(() => {
		return () => {
			unsubscribe();
		};
	});
</script>

<div data-testid="locale-value-probe"></div>
