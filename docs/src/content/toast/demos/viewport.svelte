<script lang="ts">
	import XIcon from '@lucide/svelte/icons/x';
	import { Toast } from '@human-kit/ui';
</script>

<!-- One viewport for the app. The toasts stack in the corner, and they spread out while the
     pointer rests on them or the focus is in them. -->
<Toast.Viewport class="toast-viewport">
	{#snippet children(toast)}
		<Toast.Root {toast} class="toast">
			<Toast.Content class="toast-content">
				<Toast.Title class="text-sm font-medium text-neutral-900 dark:text-white" />
				<Toast.Description class="text-sm text-neutral-600 dark:text-neutral-400" />
			</Toast.Content>
			<Toast.Close
				aria-label="Close"
				class="absolute top-2 right-2 inline-flex size-6 items-center justify-center text-neutral-500 outline-none hover:text-neutral-900 data-[focus-visible=true]:outline-solid data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-neutral-900 dark:hover:text-white dark:data-[focus-visible=true]:outline-white"
			>
				<XIcon class="size-4" />
			</Toast.Close>
		</Toast.Root>
	{/snippet}
</Toast.Viewport>

<style>
	:global(.toast-viewport) {
		position: fixed;
		inset-block-end: 1rem;
		inset-inline-end: 1rem;
		z-index: 100;
		width: 20rem;
		max-width: calc(100vw - 2rem);
		height: var(--toast-frontmost-height, 0px);
		outline: none;
	}

	:global(.toast) {
		position: absolute;
		inset-block-end: 0;
		inset-inline-end: 0;
		width: 100%;
		padding: 0.75rem 2.25rem 0.75rem 1rem;
		border: 1px solid var(--color-neutral-200);
		background: white;
		box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
		outline: none;
		transform: translateX(var(--toast-swipe-movement-x))
			translateY(calc(var(--toast-swipe-movement-y) - var(--toast-index) * 12px))
			scale(calc(1 - var(--toast-index) * 0.05));
		transform-origin: bottom center;
		transition:
			transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
			opacity 0.3s;
		z-index: calc(1000 - var(--toast-index));
	}

	:global(.dark .toast) {
		border-color: var(--color-neutral-800);
		background: var(--color-neutral-900);
	}

	/* The toasts behind the front one take its height while the stack is collapsed. */
	:global(.toast:not([data-front]):not([data-expanded])) {
		height: var(--toast-frontmost-height);
		overflow: hidden;
	}

	:global(.toast:not([data-front]):not([data-expanded]) .toast-content) {
		opacity: 0;
	}

	:global(.toast[data-expanded]) {
		transform: translateX(var(--toast-swipe-movement-x))
			translateY(
				calc(var(--toast-swipe-movement-y) - var(--toast-offset-y) - var(--toast-index) * 8px)
			);
	}

	:global(.toast[data-swiping]) {
		transition: none;
	}

	:global(.toast[data-entering]),
	:global(.toast[data-exiting]) {
		opacity: 0;
		transform: translateY(1rem);
	}

	:global(.toast[data-swipe-dismissed][data-swipe-direction='right']) {
		transform: translateX(calc(var(--toast-swipe-movement-x) + 100%));
	}

	:global(.toast[data-swipe-dismissed][data-swipe-direction='bottom']) {
		transform: translateY(calc(var(--toast-swipe-movement-y) + 100%));
	}

	:global(.toast:focus-visible) {
		outline: 2px solid var(--color-neutral-900);
		outline-offset: 2px;
	}

	:global(.dark .toast:focus-visible) {
		outline-color: white;
	}

	:global(.toast[data-limited]) {
		visibility: hidden;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.toast) {
			transition-duration: 0.01s;
		}
	}
</style>
