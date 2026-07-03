<script lang="ts">
	import { onDestroy } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import BellIcon from '@lucide/svelte/icons/bell';
	import CheckIcon from '@lucide/svelte/icons/check';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';
	import SendHorizontalIcon from '@lucide/svelte/icons/send-horizontal';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { Button, type ButtonRenderState } from '@human-kit/ui';
	import { DemoCheckbox, DemoInput, DemoSection, DemoSelect, DemoState } from '$lib/demo';

	type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger' | 'success';
	type ButtonSize = 'sm' | 'md' | 'lg';
	type ButtonType = 'button' | 'submit' | 'reset';

	const variantOptions = [
		{ value: 'primary', label: 'Primary' },
		{ value: 'secondary', label: 'Secondary' },
		{ value: 'quiet', label: 'Quiet' },
		{ value: 'danger', label: 'Danger' },
		{ value: 'success', label: 'Success' }
	];

	const sizeOptions = [
		{ value: 'sm', label: 'Small' },
		{ value: 'md', label: 'Medium' },
		{ value: 'lg', label: 'Large' }
	];

	const typeOptions = [
		{ value: 'button', label: 'button' },
		{ value: 'submit', label: 'submit' },
		{ value: 'reset', label: 'reset' }
	];

	const recipeExamples = [
		{
			title: 'Primary CTA',
			description: 'Bold confirm action with clear pressed and focus styling.',
			variant: 'primary',
			label: 'Publish changes'
		},
		{
			title: 'Secondary',
			description: 'Neutral action for low-risk follow-up work.',
			variant: 'secondary',
			label: 'Duplicate row'
		},
		{
			title: 'Quiet',
			description: 'Subtle text-like affordance for dense interfaces.',
			variant: 'quiet',
			label: 'Review details'
		},
		{
			title: 'Danger',
			description: 'Destructive affordance with strong disabled cues.',
			variant: 'danger',
			label: 'Archive project'
		},
		{
			title: 'Success',
			description: 'Positive completion action for flows that confirm work.',
			variant: 'success',
			label: 'Approve payout'
		}
	] as const;

	let playgroundLabel = $state('Save draft');
	let playgroundVariant = $state<ButtonVariant>('primary');
	let playgroundSize = $state<ButtonSize>('md');
	let playgroundType = $state<ButtonType>('button');
	let playgroundDisabled = $state(false);
	let playgroundPending = $state(false);
	let playgroundBlock = $state(false);
	let playgroundClicks = $state(0);
	let playgroundHovered = $state(false);
	let playgroundPressed = $state(false);
	let playgroundFocused = $state(false);
	let playgroundFocusVisible = $state(false);
	const playgroundLastState = $derived.by<ButtonRenderState>(() => ({
		hovered: playgroundHovered,
		pressed: playgroundPressed,
		focused: playgroundFocused,
		focusVisible: playgroundFocusVisible,
		disabled: playgroundDisabled,
		pending: playgroundPending
	}));

	let autosavePending = $state(false);
	let autosaveCount = $state(0);
	let syncPending = $state(false);
	let syncCount = $state(0);
	let exportPending = $state(false);
	let exportCount = $state(0);

	let formPending = $state(false);
	let formSaves = $state(0);
	let formResets = $state(0);
	let lastSubmission = $state('Nothing submitted yet');

	const timers = new SvelteSet<number>();

	onDestroy(() => {
		for (const timer of timers) {
			clearTimeout(timer);
		}
		timers.clear();
	});

	function schedule(duration: number, callback: () => void) {
		const timer = window.setTimeout(() => {
			timers.delete(timer);
			callback();
		}, duration);
		timers.add(timer);
	}

	function joinClasses(...values: Array<string | false | null | undefined>) {
		return values.filter(Boolean).join(' ');
	}

	function buttonClasses(
		variant: ButtonVariant,
		size: ButtonSize = 'md',
		block = false,
		iconOnly = false
	) {
		const base =
			'relative inline-flex items-center justify-center gap-2 rounded-xl font-medium shadow-sm outline-none transition-all select-none data-[pressed=true]:scale-[0.985] data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-offset-2 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-45 data-[pending=true]:cursor-progress';
		const sizes = {
			sm: iconOnly ? 'h-9 w-9 text-sm' : 'h-9 px-3.5 text-sm',
			md: iconOnly ? 'h-11 w-11 text-sm' : 'h-11 px-4 text-sm',
			lg: iconOnly ? 'h-12 w-12 text-base' : 'h-12 px-5 text-base'
		};
		const variants = {
			primary:
				'bg-blue-600 text-white ring-offset-blue-50 hover:bg-blue-700 data-[hovered=true]:bg-blue-700 data-[pressed=true]:bg-blue-800 data-[focus-visible=true]:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400 dark:data-[hovered=true]:bg-blue-400 dark:data-[pressed=true]:bg-blue-300 dark:data-[focus-visible=true]:ring-blue-300',
			secondary:
				'border border-gray-300 bg-white text-gray-900 ring-offset-white hover:border-gray-400 hover:bg-gray-50 data-[hovered=true]:border-gray-400 data-[hovered=true]:bg-gray-50 data-[pressed=true]:bg-gray-100 data-[focus-visible=true]:ring-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:hover:border-gray-500 dark:hover:bg-gray-800 dark:data-[hovered=true]:border-gray-500 dark:data-[hovered=true]:bg-gray-800 dark:data-[pressed=true]:bg-gray-700 dark:data-[focus-visible=true]:ring-gray-400',
			quiet:
				'bg-transparent text-gray-700 shadow-none ring-offset-white hover:bg-gray-100 data-[hovered=true]:bg-gray-100 data-[pressed=true]:bg-gray-200 data-[focus-visible=true]:ring-gray-400 dark:text-gray-200 dark:hover:bg-gray-800 dark:data-[hovered=true]:bg-gray-800 dark:data-[pressed=true]:bg-gray-700 dark:data-[focus-visible=true]:ring-gray-400',
			danger:
				'bg-rose-600 text-white ring-offset-rose-50 hover:bg-rose-700 data-[hovered=true]:bg-rose-700 data-[pressed=true]:bg-rose-800 data-[focus-visible=true]:ring-rose-500 dark:bg-rose-500 dark:hover:bg-rose-400 dark:data-[hovered=true]:bg-rose-400 dark:data-[pressed=true]:bg-rose-300 dark:data-[focus-visible=true]:ring-rose-300',
			success:
				'bg-emerald-600 text-white ring-offset-emerald-50 hover:bg-emerald-700 data-[hovered=true]:bg-emerald-700 data-[pressed=true]:bg-emerald-800 data-[focus-visible=true]:ring-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:data-[hovered=true]:bg-emerald-400 dark:data-[pressed=true]:bg-emerald-300 dark:data-[focus-visible=true]:ring-emerald-300'
		};

		return joinClasses(base, sizes[size], variants[variant], block && 'w-full');
	}

	function handlePlaygroundClick() {
		playgroundClicks += 1;
	}

	function togglePlaygroundPending() {
		playgroundPending = !playgroundPending;
	}

	function handlePlaygroundFocus(event: FocusEvent) {
		const target = event.currentTarget;
		if (!(target instanceof HTMLButtonElement)) return;

		playgroundFocused = true;
		playgroundFocusVisible = target.matches(':focus-visible');
	}

	function handlePlaygroundBlur() {
		playgroundHovered = false;
		playgroundPressed = false;
		playgroundFocused = false;
		playgroundFocusVisible = false;
	}

	function handlePlaygroundMouseEnter() {
		if (playgroundDisabled || playgroundPending) return;
		playgroundHovered = true;
	}

	function handlePlaygroundMouseLeave() {
		playgroundHovered = false;
		playgroundPressed = false;
	}

	function handlePlaygroundMouseDown() {
		if (playgroundDisabled || playgroundPending) return;
		playgroundPressed = true;
		playgroundFocusVisible = false;
	}

	function handlePlaygroundMouseUp() {
		playgroundPressed = false;
	}

	function handlePlaygroundKeyDown(event: KeyboardEvent) {
		if (playgroundDisabled || playgroundPending) return;
		if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;
		playgroundPressed = true;
		playgroundFocusVisible = true;
		playgroundFocused = true;
	}

	function handlePlaygroundKeyUp(event: KeyboardEvent) {
		if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;
		playgroundPressed = false;
		playgroundFocusVisible = true;
		playgroundFocused = true;
	}

	function runAsyncDemo(kind: 'autosave' | 'sync' | 'export') {
		if (kind === 'autosave') {
			if (autosavePending) return;
			autosavePending = true;
			autosaveCount += 1;
			schedule(1400, () => {
				autosavePending = false;
			});
			return;
		}

		if (kind === 'sync') {
			if (syncPending) return;
			syncPending = true;
			syncCount += 1;
			schedule(1800, () => {
				syncPending = false;
			});
			return;
		}

		if (exportPending) return;
		exportPending = true;
		exportCount += 1;
		schedule(2200, () => {
			exportPending = false;
		});
	}

	function handleFormSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (formPending) return;

		const form = event.currentTarget;
		if (!(form instanceof HTMLFormElement)) return;

		formPending = true;
		formSaves += 1;
		const formData = new FormData(form);
		lastSubmission = JSON.stringify(Object.fromEntries(formData.entries()), null, 2);

		schedule(1600, () => {
			formPending = false;
		});
	}

	function handleFormReset() {
		formResets += 1;
		lastSubmission = 'Reset triggered';
	}
</script>

<div class="space-y-8">
	<DemoSection
		title="Interactive Playground"
		description="Inspect the full interaction contract live: hovered, pressed, focused, focus-visible, disabled, pending, and native button type forwarding."
	>
		<div class="grid w-full gap-6 xl:grid-cols-[minmax(0,20rem)_1fr]">
			<div
				class="rounded-3xl border border-dashed border-gray-300 bg-white p-5 shadow-sm dark:border-gray-600 dark:bg-gray-900/80"
			>
				<div class="space-y-4">
					<p
						class="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400"
					>
						Live preview
					</p>
					<Button.Root
						type={playgroundType}
						disabled={playgroundDisabled}
						pending={playgroundPending}
						onclick={handlePlaygroundClick}
						onfocus={handlePlaygroundFocus}
						onblur={handlePlaygroundBlur}
						onmouseenter={handlePlaygroundMouseEnter}
						onmouseleave={handlePlaygroundMouseLeave}
						onmousedown={handlePlaygroundMouseDown}
						onmouseup={handlePlaygroundMouseUp}
						onkeydown={handlePlaygroundKeyDown}
						onkeyup={handlePlaygroundKeyUp}
						class={buttonClasses(playgroundVariant, playgroundSize, playgroundBlock)}
						aria-label={playgroundLabel}
					>
						{#snippet children(state)}
							{#if state.pending}
								<LoaderCircleIcon class="h-4 w-4 animate-spin" />
							{/if}
							<span class:opacity-75={state.pending}>{playgroundLabel}</span>
						{/snippet}
					</Button.Root>

					<div class="grid gap-2 rounded-2xl bg-gray-50 p-4 dark:bg-gray-800/80">
						<DemoState label="clickCount" value={playgroundClicks} />
						<DemoState label="type" value={playgroundType} />
						<DemoState label="hovered" value={playgroundLastState.hovered} />
						<DemoState label="pressed" value={playgroundLastState.pressed} />
						<DemoState label="focused" value={playgroundLastState.focused} />
						<DemoState label="focusVisible" value={playgroundLastState.focusVisible} />
						<DemoState label="pending" value={playgroundLastState.pending} />
						<DemoState label="disabled" value={playgroundLastState.disabled} />
					</div>
				</div>
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<div
					class="space-y-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
				>
					<DemoInput label="Label" bind:value={playgroundLabel} />
					<DemoSelect label="Variant" bind:value={playgroundVariant} options={variantOptions} />
					<DemoSelect label="Size" bind:value={playgroundSize} options={sizeOptions} />
					<DemoSelect label="Type" bind:value={playgroundType} options={typeOptions} />
				</div>

				<div
					class="space-y-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
				>
					<DemoCheckbox label="disabled" bind:checked={playgroundDisabled} />
					<DemoCheckbox label="pending" bind:checked={playgroundPending} />
					<DemoCheckbox label="block width" bind:checked={playgroundBlock} />
					<div class="grid grid-cols-2 gap-2 pt-2">
						<button
							type="button"
							onclick={() => (playgroundClicks = 0)}
							class="rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
						>
							Reset clicks
						</button>
						<button
							type="button"
							onclick={togglePlaygroundPending}
							class="rounded-xl border border-blue-300 bg-blue-50 px-3 py-2 text-sm text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200 dark:hover:bg-blue-900/60"
						>
							Toggle pending
						</button>
					</div>
					<p class="text-xs text-gray-500 dark:text-gray-400">
						Tip: focus the button with Tab, then hold Space or Enter to see `pressed` and
						`data-focus-visible` update together.
					</p>
				</div>
			</div>
		</div>
	</DemoSection>

	<DemoSection
		title="Recipe Gallery"
		description="A broad set of visual recipes layered on top of the same headless Button.Root API."
	>
		<div class="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-3">
			{#each recipeExamples as recipe (recipe.title)}
				<div
					class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
				>
					<div class="space-y-4">
						<div>
							<p class="text-sm font-semibold text-gray-900 dark:text-white">{recipe.title}</p>
							<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{recipe.description}</p>
						</div>
						<Button.Root class={buttonClasses(recipe.variant)}>{recipe.label}</Button.Root>
					</div>
				</div>
			{/each}

			<div
				class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
			>
				<div class="space-y-4">
					<div>
						<p class="text-sm font-semibold text-gray-900 dark:text-white">Pending state</p>
						<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
							Focusable, announced to assistive tech, but activation is suppressed.
						</p>
					</div>
					<Button.Root pending class={buttonClasses('primary')} aria-label="Save changes">
						{#snippet children(state)}
							<LoaderCircleIcon class="h-4 w-4 animate-spin" />
							<span class:opacity-75={state.pending}>Save changes</span>
						{/snippet}
					</Button.Root>
				</div>
			</div>

			<div
				class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
			>
				<div class="space-y-4">
					<div>
						<p class="text-sm font-semibold text-gray-900 dark:text-white">Disabled state</p>
						<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
							Native disablement when the action must be fully unavailable.
						</p>
					</div>
					<Button.Root disabled class={buttonClasses('secondary')}>Unavailable slot</Button.Root>
				</div>
			</div>
		</div>
	</DemoSection>

	<DemoSection
		title="Async Actions"
		description="Three common pending-action patterns showing that repeated activation is blocked while each action is busy."
	>
		<div class="grid w-full gap-4 xl:grid-cols-3">
			<div
				class="rounded-2xl border border-blue-200 bg-linear-to-br from-blue-50 to-white p-5 shadow-sm dark:border-blue-900 dark:from-blue-950/40 dark:to-gray-900"
			>
				<p class="text-sm font-semibold text-gray-900 dark:text-white">Autosave draft</p>
				<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
					Short task with a subtle quiet-style action.
				</p>
				<div class="mt-4 flex items-center gap-3">
					<Button.Root
						pending={autosavePending}
						onclick={() => runAsyncDemo('autosave')}
						class={buttonClasses('quiet')}
						aria-label="Autosave draft"
					>
						{#snippet children(state)}
							{#if state.pending}
								<LoaderCircleIcon class="h-4 w-4 animate-spin" />
							{:else}
								<CheckIcon class="h-4 w-4" />
							{/if}
							<span>{state.pending ? 'Saving...' : 'Save draft'}</span>
						{/snippet}
					</Button.Root>
					<DemoState label="runs" value={autosaveCount} />
				</div>
			</div>

			<div
				class="rounded-2xl border border-emerald-200 bg-linear-to-br from-emerald-50 to-white p-5 shadow-sm dark:border-emerald-900 dark:from-emerald-950/40 dark:to-gray-900"
			>
				<p class="text-sm font-semibold text-gray-900 dark:text-white">Sync billing</p>
				<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
					Medium-duration operation styled as a positive action.
				</p>
				<div class="mt-4 flex items-center gap-3">
					<Button.Root
						pending={syncPending}
						onclick={() => runAsyncDemo('sync')}
						class={buttonClasses('success')}
						aria-label="Sync billing"
					>
						{#snippet children(state)}
							{#if state.pending}
								<LoaderCircleIcon class="h-4 w-4 animate-spin" />
							{:else}
								<RotateCcwIcon class="h-4 w-4" />
							{/if}
							<span>{state.pending ? 'Syncing...' : 'Sync now'}</span>
						{/snippet}
					</Button.Root>
					<DemoState label="runs" value={syncCount} />
				</div>
			</div>

			<div
				class="rounded-2xl border border-amber-200 bg-linear-to-br from-amber-50 to-white p-5 shadow-sm dark:border-amber-900 dark:from-amber-950/30 dark:to-gray-900"
			>
				<p class="text-sm font-semibold text-gray-900 dark:text-white">Export report</p>
				<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
					Longer task with a more prominent primary CTA.
				</p>
				<div class="mt-4 flex items-center gap-3">
					<Button.Root
						pending={exportPending}
						onclick={() => runAsyncDemo('export')}
						class={buttonClasses('primary')}
						aria-label="Export report"
					>
						{#snippet children(state)}
							{#if state.pending}
								<LoaderCircleIcon class="h-4 w-4 animate-spin" />
							{:else}
								<DownloadIcon class="h-4 w-4" />
							{/if}
							<span>{state.pending ? 'Generating...' : 'Export CSV'}</span>
						{/snippet}
					</Button.Root>
					<DemoState label="runs" value={exportCount} />
				</div>
			</div>
		</div>
	</DemoSection>

	<DemoSection
		title="Forms and Native Types"
		description="Shows `type=submit` and `type=reset`, plus the pending safeguard that prevents accidental duplicate submits."
	>
		<div class="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
			<form
				onsubmit={handleFormSubmit}
				onreset={handleFormReset}
				class="space-y-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
			>
				<div class="grid gap-4 md:grid-cols-2">
					<label class="space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
						<span>Workspace name</span>
						<input
							name="workspace"
							value="Northwind Ops"
							class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
						/>
					</label>
					<label class="space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
						<span>Owner email</span>
						<input
							name="owner"
							value="ops@northwind.dev"
							class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
						/>
					</label>
				</div>

				<div class="flex flex-wrap gap-3">
					<Button.Root
						type="submit"
						pending={formPending}
						class={buttonClasses('primary')}
						aria-label="Save workspace settings"
					>
						{#snippet children(state)}
							{#if state.pending}
								<LoaderCircleIcon class="h-4 w-4 animate-spin" />
							{:else}
								<CheckIcon class="h-4 w-4" />
							{/if}
							<span>{state.pending ? 'Saving settings...' : 'Save settings'}</span>
						{/snippet}
					</Button.Root>

					<Button.Root type="reset" class={buttonClasses('secondary')}>
						<RotateCcwIcon class="h-4 w-4" />
						<span>Reset form</span>
					</Button.Root>
				</div>

				<pre
					class="overflow-x-auto rounded-2xl bg-gray-950 p-4 text-xs text-emerald-300">{lastSubmission}</pre>
			</form>

			<div
				class="space-y-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
			>
				<DemoState label="saveCount" value={formSaves} />
				<DemoState label="resetCount" value={formResets} />
				<DemoState label="pending" value={formPending} />
				<p class="text-xs text-gray-500 dark:text-gray-400">
					While pending, the submit button renders as `type="button"`, so pressing Enter in the form
					will not resubmit.
				</p>
			</div>
		</div>
	</DemoSection>

	<DemoSection
		title="Icon-Only and Compound Content"
		description="Examples that highlight accessible icon buttons, trailing affordances, and compact toolbar-like actions."
	>
		<div class="flex w-full flex-col gap-6">
			<div
				class="flex flex-wrap items-center gap-3 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
			>
				<Button.Root
					class={buttonClasses('secondary', 'md', false, true)}
					aria-label="Notifications"
				>
					<BellIcon class="h-4 w-4" />
				</Button.Root>
				<Button.Root class={buttonClasses('danger', 'md', false, true)} aria-label="Delete record">
					<Trash2Icon class="h-4 w-4" />
				</Button.Root>
				<Button.Root class={buttonClasses('primary')}>
					<SendHorizontalIcon class="h-4 w-4" />
					<span>Send invite</span>
				</Button.Root>
				<Button.Root class={buttonClasses('quiet')}>
					<span>Continue</span>
					<ArrowRightIcon class="h-4 w-4" />
				</Button.Root>
			</div>

			<div class="grid gap-4 md:grid-cols-3">
				<div
					class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
				>
					<p class="text-sm font-semibold text-gray-900 dark:text-white">Icon-only</p>
					<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
						Always pair icon-only buttons with an explicit `aria-label`.
					</p>
				</div>
				<div
					class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
				>
					<p class="text-sm font-semibold text-gray-900 dark:text-white">Leading icon</p>
					<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
						Good for actions with a clear semantic object such as export, send, or save.
					</p>
				</div>
				<div
					class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
				>
					<p class="text-sm font-semibold text-gray-900 dark:text-white">Trailing affordance</p>
					<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
						Useful when the label is the primary content and the icon reinforces direction.
					</p>
				</div>
			</div>
		</div>
	</DemoSection>
</div>
