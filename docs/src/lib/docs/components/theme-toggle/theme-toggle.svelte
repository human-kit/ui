<script lang="ts">
	import { theme } from '../../theme.svelte.js';
	import Button from '../button/button.svelte';
	import Sun from '../icons/sun.svelte';
	import Moon from '../icons/moon.svelte';
</script>

<Button variant="ghost" size="icon" onclick={() => theme.toggle()} aria-label="Toggle color theme">
	<!-- Which icon shows is driven by the `.dark` class (set by the anti-FOUC
	     script before paint), not by JS state, so it never flips on hydration. -->
	<Sun class="hidden dark:block" />
	<Moon class="dark:hidden" />
</Button>
