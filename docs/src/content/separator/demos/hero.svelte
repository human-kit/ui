<script lang="ts">
	import { Separator } from '@human-kit/ui';
</script>

<div class="flex w-72 flex-col gap-4 text-sm text-neutral-900 dark:text-white">
	<p>An account for the whole team, with one bill.</p>
	<Separator class="h-px w-full bg-neutral-200 dark:bg-neutral-800" />
	<p>Each member keeps a workspace of their own.</p>
	<div class="flex h-5 items-center gap-3">
		<span>Edit</span>
		<Separator orientation="vertical" class="h-full w-px bg-neutral-200 dark:bg-neutral-800" />
		<span>Share</span>
		<Separator orientation="vertical" class="h-full w-px bg-neutral-200 dark:bg-neutral-800" />
		<span>Delete</span>
	</div>
</div>
