<script lang="ts">
	import { Avatar } from '../index';
	import LocaleProvider from '../../locale-provider/index';

	let {
		names = ['Ada', 'Grace', 'Katherine', 'Mary', 'Dorothy'],
		max = undefined,
		locale = undefined,
		lazy = false
	}: { names?: string[]; max?: number; locale?: string; lazy?: boolean } = $props();
</script>

<div style="height: 200vh"></div>
<LocaleProvider {locale}>
	<Avatar.Group {max} aria-label="Assignees" data-testid="group">
		{#each names as name (name)}
			<Avatar.Root data-testid="avatar">
				<Avatar.Image src={null} alt={name} loading={lazy ? 'lazy' : 'eager'} />
				<Avatar.Fallback>{name.slice(0, 1)}</Avatar.Fallback>
			</Avatar.Root>
		{/each}
		<Avatar.Count data-testid="count" />
	</Avatar.Group>
</LocaleProvider>
