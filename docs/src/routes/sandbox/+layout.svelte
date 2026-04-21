<script lang="ts">
	import { resolve } from '$app/paths';
	import './sandbox.css';
	import { Frame } from '$lib/sandbox/frame';

	let { children } = $props();
</script>

<div class="sandbox-theme">
	<Frame.Root>
		<aside
			class="w-75 shrink-0 rounded-2xl corner-squircle border border-border bg-depth-1 px-5 py-6 shadow-sm"
		>
			<div class="space-y-6 text-sm text-muted-foreground">
				<div>
					<p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Sandbox</p>
					<h1 class="mt-2 text-xl font-semibold text-foreground">Purchasing</h1>
					<p class="mt-2 leading-6">
						Standalone shell that mirrors the consumer app route so table first-paint behavior can
						be inspected without the docs layout around it.
					</p>
				</div>

				<nav class="space-y-2">
					<a
						href={resolve('/sandbox')}
						aria-current="page"
						class="block rounded-lg border border-border bg-depth-2 px-3 py-2 font-medium text-foreground"
					>
						Purchase Requests
					</a>
				</nav>

				<div class="rounded-xl border border-border bg-depth-2 px-3 py-3 text-xs leading-5">
					Exact ingredients copied here: app shell, frame layout, wrapper table, selection column,
					and the same width mix from the original route.
				</div>
			</div>
		</aside>

		<Frame.Content>
			{@render children()}
		</Frame.Content>
	</Frame.Root>
</div>
