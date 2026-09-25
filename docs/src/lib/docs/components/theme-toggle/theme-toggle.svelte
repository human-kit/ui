<script lang="ts">
	import { theme } from '../../theme.svelte.js';
	import Button from '../button/button.svelte';
	import Sun from '../icons/sun.svelte';
	import Moon from '../icons/moon.svelte';
	import { track } from '$lib/docs/telemetry';

	function toggle() {
		theme.toggle();
		track('theme_change', { to: theme.dark ? 'dark' : 'light' });
	}
</script>

<Button variant="ghost" size="icon" onclick={toggle} aria-label="Toggle color theme">
	<!-- Which icon shows is driven by the `.dark` class (set by the anti-FOUC
	     script before paint), not by JS state, so it never flips on hydration. -->
	<Sun class="hidden dark:block" />
	<Moon class="dark:hidden" />
</Button>
