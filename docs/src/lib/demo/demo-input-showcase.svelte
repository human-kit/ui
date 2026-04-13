<script lang="ts">
	import { Input } from '@human-kit/svelte-components';
	import { DemoCheckbox, DemoInput, DemoSection, DemoSelect, DemoState } from '$lib/demo';

	type InputType = 'text' | 'email' | 'search' | 'password' | 'url';

	const typeOptions = [
		{ value: 'text', label: 'text' },
		{ value: 'email', label: 'email' },
		{ value: 'search', label: 'search' },
		{ value: 'password', label: 'password' },
		{ value: 'url', label: 'url' }
	] satisfies Array<{ value: InputType; label: string }>;

	const demoInputClass =
		'bg-depth-2 sunken placeholder:text-muted-foreground h-10 w-full rounded-xl border px-3 text-sm shadow-xs transition-all ease-out outline-none data-[hovered=true]:bg-depth-1 data-[focus-visible=true]:ring-border data-[focus-visible=true]:ring data-[focus-visible=true]:ring-offset-1 data-[disabled=true]:pointer-events-none data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 data-[readonly=true]:cursor-default data-[invalid=true]:ring-red-500 data-[focus-visible=true]:data-[invalid=true]:ring-red-500';

	let playgroundType = $state<InputType>('text');
	let playgroundValue = $state('');
	let playgroundPlaceholder = $state('Type something...');
	let playgroundDisabled = $state(false);
	let playgroundReadOnly = $state(false);
	let playgroundInvalid = $state(false);
	let playgroundRequired = $state(false);
	let playgroundHovered = $state(false);
	let playgroundFocused = $state(false);
	let playgroundFocusVisible = $state(false);
	let playgroundElement = $state<HTMLInputElement | null>(null);

	const dataDisabled = $derived(playgroundElement?.getAttribute('data-disabled'));
	const dataReadOnly = $derived(playgroundElement?.getAttribute('data-readonly'));
	const dataInvalid = $derived(playgroundElement?.getAttribute('data-invalid'));
	const dataRequired = $derived(playgroundElement?.getAttribute('data-required'));

	function handlePlaygroundInput(event: Event) {
		const target = event.currentTarget;
		if (!(target instanceof HTMLInputElement)) return;
		playgroundValue = target.value;
	}

	function handlePlaygroundFocus(event: FocusEvent) {
		const target = event.currentTarget;
		if (!(target instanceof HTMLInputElement)) return;

		playgroundFocused = true;
		playgroundFocusVisible = target.matches(':focus-visible');
	}

	function handlePlaygroundBlur() {
		playgroundFocused = false;
		playgroundFocusVisible = false;
	}

	function handlePlaygroundMouseEnter() {
		if (playgroundDisabled) return;
		playgroundHovered = true;
	}

	function handlePlaygroundMouseLeave() {
		playgroundHovered = false;
	}

	let readonlyValue = $state('INV-2026-0042');
	let emailValue = $state('ops@northwind.dev');
	let searchValue = $state('Argentina');

	function handleReadonlyInput(event: Event) {
		const target = event.currentTarget;
		if (!(target instanceof HTMLInputElement)) return;
		readonlyValue = target.value;
	}

	function handleEmailInput(event: Event) {
		const target = event.currentTarget;
		if (!(target instanceof HTMLInputElement)) return;
		emailValue = target.value;
	}

	function handleSearchInput(event: Event) {
		const target = event.currentTarget;
		if (!(target instanceof HTMLInputElement)) return;
		searchValue = target.value;
	}
</script>

<div class="space-y-8">
	<DemoSection
		title="Interactive Playground"
		description="Inspect the focus contract, disabled and read-only booleans, and validation attrs on the native input."
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
					<Input
						bind:element={playgroundElement}
						type={playgroundType}
						value={playgroundValue}
						placeholder={playgroundPlaceholder}
						isDisabled={playgroundDisabled}
						isReadOnly={playgroundReadOnly}
						isInvalid={playgroundInvalid}
						isRequired={playgroundRequired}
						aria-label="Playground input"
						oninput={handlePlaygroundInput}
						onfocus={handlePlaygroundFocus}
						onblur={handlePlaygroundBlur}
						onmouseenter={handlePlaygroundMouseEnter}
						onmouseleave={handlePlaygroundMouseLeave}
						class={demoInputClass}
					/>

					<div class="grid gap-2 rounded-2xl bg-gray-50 p-4 dark:bg-gray-800/80">
						<DemoState label="value" value={playgroundValue} />
						<DemoState label="isHovered" value={playgroundHovered} />
						<DemoState label="isFocused" value={playgroundFocused} />
						<DemoState label="isFocusVisible" value={playgroundFocusVisible} />
						<DemoState label="data-disabled" value={dataDisabled} />
						<DemoState label="data-readonly" value={dataReadOnly} />
						<DemoState label="data-invalid" value={dataInvalid} />
						<DemoState label="data-required" value={dataRequired} />
					</div>
				</div>
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<div
					class="space-y-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
				>
					<DemoSelect label="type" bind:value={playgroundType} options={typeOptions} />
					<DemoInput label="placeholder" bind:value={playgroundPlaceholder} />
					<DemoInput label="value" bind:value={playgroundValue} />
				</div>

				<div
					class="space-y-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
				>
					<DemoCheckbox label="isDisabled" bind:checked={playgroundDisabled} />
					<DemoCheckbox label="isReadOnly" bind:checked={playgroundReadOnly} />
					<DemoCheckbox label="isInvalid" bind:checked={playgroundInvalid} />
					<DemoCheckbox label="isRequired" bind:checked={playgroundRequired} />
					<p class="text-xs text-gray-500 dark:text-gray-400">
						Tip: tab into the field to inspect <code>data-focus-visible</code>, then click it to see
						pointer takeover clear that attribute while focus remains.
					</p>
				</div>
			</div>
		</div>
	</DemoSection>

	<DemoSection
		title="Common Recipes"
		description="Examples of the base Input primitive styled through its data attrs rather than wrapping a higher-level TextField yet."
	>
		<div class="grid w-full gap-4 md:grid-cols-2 xl:grid-cols-3">
			<div
				class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
			>
				<p class="text-sm font-semibold text-gray-900 dark:text-white">Email input</p>
				<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
					Required field with invalid styling hooks.
				</p>
				<div class="mt-4 space-y-2">
					<Input
						type="email"
						value={emailValue}
						placeholder="name@example.com"
						isRequired
						isInvalid={!emailValue.includes('@')}
						aria-label="Email address"
						oninput={handleEmailInput}
						class={demoInputClass}
					/>
					<p class="text-xs text-gray-500 dark:text-gray-400">Current value: {emailValue}</p>
				</div>
			</div>

			<div
				class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
			>
				<p class="text-sm font-semibold text-gray-900 dark:text-white">Search input</p>
				<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
					Native search type with pointer and keyboard focus states.
				</p>
				<div class="mt-4 space-y-2">
					<Input
						type="search"
						value={searchValue}
						placeholder="Search country"
						aria-label="Search countries"
						oninput={handleSearchInput}
						class={demoInputClass}
					/>
					<p class="text-xs text-gray-500 dark:text-gray-400">Query: {searchValue}</p>
				</div>
			</div>

			<div
				class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
			>
				<p class="text-sm font-semibold text-gray-900 dark:text-white">Read-only token</p>
				<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
					Focusable and selectable, but not editable.
				</p>
				<div class="mt-4 space-y-2">
					<Input
						value={readonlyValue}
						isReadOnly
						aria-label="Invoice reference"
						oninput={handleReadonlyInput}
						class={`${demoInputClass} font-mono`}
					/>
					<p class="text-xs text-gray-500 dark:text-gray-400">Reference: {readonlyValue}</p>
				</div>
			</div>
		</div>
	</DemoSection>

	<DemoSection
		title="State Grid"
		description="Compare the primitive in enabled, invalid, read-only, and disabled states side by side."
	>
		<div class="grid w-full gap-4 md:grid-cols-2 xl:grid-cols-4">
			<div
				class="space-y-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
			>
				<p class="text-sm font-semibold text-gray-900 dark:text-white">Default</p>
				<Input aria-label="Default input" placeholder="Type here" class={demoInputClass} />
			</div>
			<div
				class="space-y-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
			>
				<p class="text-sm font-semibold text-gray-900 dark:text-white">Invalid</p>
				<Input aria-label="Invalid input" value="bad@" isInvalid class={demoInputClass} />
			</div>
			<div
				class="space-y-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
			>
				<p class="text-sm font-semibold text-gray-900 dark:text-white">Read only</p>
				<Input
					aria-label="Read only input"
					value="Readonly content"
					isReadOnly
					class={demoInputClass}
				/>
			</div>
			<div
				class="space-y-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
			>
				<p class="text-sm font-semibold text-gray-900 dark:text-white">Disabled</p>
				<Input
					aria-label="Disabled input"
					value="Disabled content"
					isDisabled
					class={demoInputClass}
				/>
			</div>
		</div>
	</DemoSection>
</div>
