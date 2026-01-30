<script lang="ts">
	import { Dialog } from '$lib/components/dialog';
	import { ComboBox } from '$lib/components/combobox';
	import { DemoSection, DemoCheckbox, DemoSelect, DemoState } from '$lib/components/demo';

	// Interactive playground state
	let shouldCloseOnEscape = $state(true);
	let shouldCloseOnInteractOutside = $state(true);
	let defaultOpen = $state(false);
	let isOpen = $state(false);

	// Controlled dialog state
	let controlledOpen = $state(false);

	// Countries for ComboBox demo
	const comboboxCountries = [
		{ id: 'ar', name: 'Argentina' },
		{ id: 'br', name: 'Brazil' },
		{ id: 'ca', name: 'Canada' },
		{ id: 'fr', name: 'France' },
		{ id: 'de', name: 'Germany' },
		{ id: 'it', name: 'Italy' },
		{ id: 'jp', name: 'Japan' },
		{ id: 'mx', name: 'Mexico' },
		{ id: 'es', name: 'Spain' },
		{ id: 'us', name: 'United States' }
	];
</script>

<div class="min-h-screen bg-gray-100 p-8 dark:bg-gray-950">
	<div class="mx-auto max-w-5xl">
		<h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Dialog</h1>
		<p class="mb-8 text-gray-600 dark:text-gray-400">
			A modal dialog component with customizable overlay and content.
		</p>

		<div class="space-y-8">
			<!-- Interactive Playground -->
			<DemoSection title="Interactive Playground" description="Test all Dialog props interactively">
				{#snippet children()}
					<Dialog.Root bind:open={isOpen} {defaultOpen} onOpenChange={(open) => (isOpen = open)}>
						{#snippet children({ close })}
							<Dialog.Trigger>
								<button
									class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
								>
									Open Dialog
								</button>
							</Dialog.Trigger>
							<Dialog.Portal>
								<Dialog.Overlay />
								<Dialog.Content
									{shouldCloseOnEscape}
									{shouldCloseOnInteractOutside}
									class="w-100 max-w-[90vw] rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800"
								>
									<h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
										Dialog Title
									</h3>
									<p class="mb-6 text-gray-600 dark:text-gray-300">
										This is the dialog content. Try the controls on the right to change behavior.
									</p>
									<div class="flex justify-end gap-3">
										<button
											onclick={close}
											class="rounded-lg px-4 py-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
										>
											Cancel
										</button>
										<button
											onclick={close}
											class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
										>
											Confirm
										</button>
									</div>
								</Dialog.Content>
							</Dialog.Portal>
						{/snippet}
					</Dialog.Root>
				{/snippet}

				{#snippet controls()}
					<div class="space-y-4">
						<DemoCheckbox label="shouldCloseOnEscape" bind:checked={shouldCloseOnEscape} />
						<DemoCheckbox
							label="shouldCloseOnInteractOutside"
							bind:checked={shouldCloseOnInteractOutside}
						/>
						<DemoCheckbox label="defaultOpen" bind:checked={defaultOpen} />
						<hr class="border-gray-200 dark:border-gray-700" />
						<DemoState label="isOpen" value={isOpen} />
					</div>
				{/snippet}
			</DemoSection>

			<!-- Controlled vs Uncontrolled -->
			<DemoSection
				title="Controlled Mode"
				description="Control the dialog state externally with bind:open"
			>
				{#snippet children()}
					<div class="space-y-4 text-center">
						<div class="flex justify-center gap-2">
							<button
								onclick={() => (controlledOpen = true)}
								class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
							>
								Open Externally
							</button>
							<button
								onclick={() => (controlledOpen = false)}
								class="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
							>
								Close Externally
							</button>
						</div>

						<Dialog.Root bind:open={controlledOpen}>
							{#snippet children({ close, isOpen: snippetIsOpen })}
								<Dialog.Portal>
									<Dialog.Overlay />
									<Dialog.Content
										class="w-100 max-w-[90vw] rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800"
									>
										<h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
											Controlled Dialog
										</h3>
										<p class="mb-2 text-gray-600 dark:text-gray-300">
											This dialog is controlled via <code
												class="rounded bg-gray-100 px-1 dark:bg-gray-700">bind:open</code
											>.
										</p>
										<p class="mb-6 text-sm text-gray-500 dark:text-gray-400">
											isOpen from snippet: <code class="rounded bg-gray-100 px-1 dark:bg-gray-700"
												>{snippetIsOpen}</code
											>
										</p>
										<div class="flex justify-end">
											<button
												onclick={close}
												class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
											>
												Close
											</button>
										</div>
									</Dialog.Content>
								</Dialog.Portal>
							{/snippet}
						</Dialog.Root>
					</div>
				{/snippet}

				{#snippet controls()}
					<div class="space-y-4">
						<DemoCheckbox label="controlledOpen" bind:checked={controlledOpen} />
						<DemoState label="controlledOpen" value={controlledOpen} />
					</div>
				{/snippet}
			</DemoSection>

			<!-- Custom Overlay -->
			<DemoSection title="Custom Overlay" description="Customize the backdrop with any CSS classes">
				{#snippet children()}
					<Dialog.Root>
						{#snippet children({ close })}
							<Dialog.Trigger>
								<button
									class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
								>
									Open with Custom Overlay
								</button>
							</Dialog.Trigger>
							<Dialog.Portal>
								<Dialog.Overlay class="bg-purple-900/70! backdrop-blur-sm" />
								<Dialog.Content
									class="w-100 max-w-[90vw] rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800"
								>
									<h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
										Custom Overlay
									</h3>
									<p class="mb-6 text-gray-600 dark:text-gray-300">
										This dialog has a purple blurred backdrop.
									</p>
									<div class="flex justify-end">
										<button
											onclick={close}
											class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
										>
											Nice!
										</button>
									</div>
								</Dialog.Content>
							</Dialog.Portal>
						{/snippet}
					</Dialog.Root>
				{/snippet}
			</DemoSection>

			<!-- Nested Dialogs -->
			<DemoSection title="Nested Dialogs" description="Open a dialog from within another dialog">
				{#snippet children()}
					<Dialog.Root>
						{#snippet children({ close })}
							<Dialog.Trigger>
								<button
									class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
								>
									Open First Dialog
								</button>
							</Dialog.Trigger>
							<Dialog.Portal>
								<Dialog.Overlay />
								<Dialog.Content
									class="w-100 max-w-[90vw] rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800"
								>
									<h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
										First Dialog
									</h3>
									<p class="mb-6 text-gray-600 dark:text-gray-300">
										Click below to open a nested dialog.
									</p>

									<!-- Nested Dialog -->
									<Dialog.Root>
										{#snippet children({ close: closeNested })}
											<Dialog.Trigger>
												<button
													class="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
												>
													Open Nested Dialog
												</button>
											</Dialog.Trigger>
											<Dialog.Portal>
												<Dialog.Overlay />
												<Dialog.Content
													class="w-87.5 max-w-[85vw] rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800"
												>
													<h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
														Nested Dialog
													</h3>
													<p class="mb-6 text-gray-600 dark:text-gray-300">
														This is a nested dialog!
													</p>
													<div class="flex justify-end">
														<button
															onclick={closeNested}
															class="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
														>
															Close Nested
														</button>
													</div>
												</Dialog.Content>
											</Dialog.Portal>
										{/snippet}
									</Dialog.Root>

									<div class="mt-4 flex justify-end">
										<button
											onclick={close}
											class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
										>
											Close First
										</button>
									</div>
								</Dialog.Content>
							</Dialog.Portal>
						{/snippet}
					</Dialog.Root>
				{/snippet}
			</DemoSection>

			<!-- Form Dialog -->
			<DemoSection title="Form Dialog" description="A dialog containing a form with validation">
				{#snippet children()}
					<Dialog.Root>
						{#snippet children({ close })}
							<Dialog.Trigger>
								<button
									class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
								>
									Open Form Dialog
								</button>
							</Dialog.Trigger>
							<Dialog.Portal>
								<Dialog.Overlay />
								<Dialog.Content
									shouldCloseOnInteractOutside={false}
									class="w-112.5 max-w-[90vw] rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800"
								>
									<h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
										Create Account
									</h3>
									<form
										class="space-y-4"
										onsubmit={(e) => {
											e.preventDefault();
											close();
										}}
									>
										<div>
											<!-- svelte-ignore a11y_label_has_associated_control -->
											<label
												class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
											>
												Name
											</label>
											<input
												type="text"
												required
												class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
											/>
										</div>
										<div>
											<!-- svelte-ignore a11y_label_has_associated_control -->
											<label
												class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
											>
												Email
											</label>
											<input
												type="email"
												required
												class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
											/>
										</div>
										<div class="flex justify-end gap-3 pt-4">
											<button
												type="button"
												onclick={close}
												class="rounded-lg px-4 py-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
											>
												Cancel
											</button>
											<button
												type="submit"
												class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
											>
												Create
											</button>
										</div>
									</form>
								</Dialog.Content>
							</Dialog.Portal>
						{/snippet}
					</Dialog.Root>
				{/snippet}
			</DemoSection>

			<!-- Dialog with ComboBox -->
			<DemoSection
				title="Dialog with ComboBox"
				description="Test overlays (popover) inside a dialog"
			>
				{#snippet children()}
					<Dialog.Root>
						{#snippet children({ close })}
							<Dialog.Trigger>
								<button
									class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
								>
									Open Dialog with ComboBox
								</button>
							</Dialog.Trigger>
							<Dialog.Portal>
								<Dialog.Overlay />
								<Dialog.Content
									class="w-112.5 max-w-[90vw] rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800"
								>
									<h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
										Select a Country
									</h3>
									<p class="mb-4 text-sm text-gray-600 dark:text-gray-300">
										The ComboBox popover should appear above the dialog overlay.
									</p>
									<div class="mb-6">
										<ComboBox.Root trigger="focus">
											<div class="flex gap-1">
												<ComboBox.Input
													placeholder="Search countries..."
													class="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
												/>
												<ComboBox.Button
													class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
												/>
											</div>
											<ComboBox.Popover
												class="mt-1 max-h-48 overflow-auto rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
											>
												<ComboBox.List emptyPlaceholder="No countries found">
													{#each comboboxCountries as country (country.id)}
														<ComboBox.Item
															id={country.id}
															textValue={country.name}
															class="cursor-pointer px-3 py-2 text-gray-900 hover:bg-gray-100 data-[focused=true]:bg-gray-100 data-[selected=true]:bg-blue-600 data-[selected=true]:text-white dark:text-white dark:hover:bg-gray-700"
														>
															{country.name}
														</ComboBox.Item>
													{/each}
												</ComboBox.List>
											</ComboBox.Popover>
										</ComboBox.Root>
									</div>
									<div class="flex justify-end">
										<button
											onclick={close}
											class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
										>
											Done
										</button>
									</div>
								</Dialog.Content>
							</Dialog.Portal>
						{/snippet}
					</Dialog.Root>
				{/snippet}
			</DemoSection>

			<!-- 5 Nested Dialogs -->
			<DemoSection
				title="5 Nested Dialogs"
				description="Stress test the dialog stack with 5 levels of nesting"
			>
				{#snippet children()}
					<Dialog.Root>
						{#snippet children({ close })}
							<Dialog.Trigger>
								<button
									class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
								>
									Open Level 1
								</button>
							</Dialog.Trigger>
							<Dialog.Portal>
								<Dialog.Overlay />
								<Dialog.Content
									class="w-105 max-w-[90vw] rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800"
								>
									<h3 class="mb-2 text-lg font-semibold text-blue-600">Level 1</h3>
									<p class="mb-4 text-sm text-gray-600 dark:text-gray-300">
										Each dialog opens the next level. Press Escape to close one at a time.
									</p>

									<!-- Level 2 -->
									<Dialog.Root>
										{#snippet children({ close: close2 })}
											<Dialog.Trigger>
												<button
													class="mb-4 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
												>
													Open Level 2
												</button>
											</Dialog.Trigger>
											<Dialog.Portal>
												<Dialog.Overlay />
												<Dialog.Content
													class="w-95 max-w-[85vw] rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800"
												>
													<h3 class="mb-2 text-lg font-semibold text-green-600">Level 2</h3>
													<p class="mb-4 text-sm text-gray-600 dark:text-gray-300">
														You're two levels deep now.
													</p>

													<!-- Level 3 -->
													<Dialog.Root>
														{#snippet children({ close: close3 })}
															<Dialog.Trigger>
																<button
																	class="mb-4 rounded-lg bg-yellow-600 px-4 py-2 text-white transition-colors hover:bg-yellow-700"
																>
																	Open Level 3
																</button>
															</Dialog.Trigger>
															<Dialog.Portal>
																<Dialog.Overlay />
																<Dialog.Content
																	class="w-85 max-w-[80vw] rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800"
																>
																	<h3 class="mb-2 text-lg font-semibold text-yellow-600">
																		Level 3
																	</h3>
																	<p class="mb-4 text-sm text-gray-600 dark:text-gray-300">
																		Three levels! Keep going...
																	</p>

																	<!-- Level 4 -->
																	<Dialog.Root>
																		{#snippet children({ close: close4 })}
																			<Dialog.Trigger>
																				<button
																					class="mb-4 rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700"
																				>
																					Open Level 4
																				</button>
																			</Dialog.Trigger>
																			<Dialog.Portal>
																				<Dialog.Overlay />
																				<Dialog.Content
																					class="w-75 max-w-[75vw] rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800"
																				>
																					<h3 class="mb-2 text-lg font-semibold text-orange-600">
																						Level 4
																					</h3>
																					<p class="mb-4 text-sm text-gray-600 dark:text-gray-300">
																						Almost there! One more to go.
																					</p>

																					<!-- Level 5 -->
																					<Dialog.Root>
																						{#snippet children({ close: close5 })}
																							<Dialog.Trigger>
																								<button
																									class="mb-4 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
																								>
																									Open Level 5
																								</button>
																							</Dialog.Trigger>
																							<Dialog.Portal>
																								<Dialog.Overlay />
																								<Dialog.Content
																									class="w-65 max-w-[70vw] rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800"
																								>
																									<h3
																										class="mb-2 text-lg font-semibold text-red-600"
																									>
																										Level 5 🎉
																									</h3>
																									<p
																										class="mb-4 text-sm text-gray-600 dark:text-gray-300"
																									>
																										You've reached the deepest level!
																									</p>
																									<button
																										onclick={close5}
																										class="w-full rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
																									>
																										Close Level 5
																									</button>
																								</Dialog.Content>
																							</Dialog.Portal>
																						{/snippet}
																					</Dialog.Root>

																					<button
																						onclick={close4}
																						class="w-full rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700"
																					>
																						Close Level 4
																					</button>
																				</Dialog.Content>
																			</Dialog.Portal>
																		{/snippet}
																	</Dialog.Root>

																	<button
																		onclick={close3}
																		class="w-full rounded-lg bg-yellow-600 px-4 py-2 text-white transition-colors hover:bg-yellow-700"
																	>
																		Close Level 3
																	</button>
																</Dialog.Content>
															</Dialog.Portal>
														{/snippet}
													</Dialog.Root>

													<button
														onclick={close2}
														class="w-full rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
													>
														Close Level 2
													</button>
												</Dialog.Content>
											</Dialog.Portal>
										{/snippet}
									</Dialog.Root>

									<button
										onclick={close}
										class="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
									>
										Close Level 1
									</button>
								</Dialog.Content>
							</Dialog.Portal>
						{/snippet}
					</Dialog.Root>
				{/snippet}
			</DemoSection>
		</div>
	</div>
</div>
