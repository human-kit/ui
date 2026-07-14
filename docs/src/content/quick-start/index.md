---
title: Quick Start
description: Install @human-kit/ui and render your first accessible component in a couple of minutes.
---

# Quick Start

`@human-kit/ui` is a set of headless, accessible UI primitives for **Svelte 5**. Components ship the behavior, semantics, and keyboard/focus handling — you bring the styles.

## Installation

```bash
npm install @human-kit/ui
```

Svelte 5 is a peer dependency, so make sure your project is on it:

```bash
npm install svelte@^5
```

The package is published as native ESM with per-component subpath exports, so bundlers only include what you import.

## Your first component

Every primitive is a set of composable parts under a namespace. Import from the barrel or a per-component subpath:

```svelte
<script lang="ts">
	import { Button } from '@human-kit/ui';
	// or: import { Button } from '@human-kit/ui/button';

	let count = $state(0);
</script>

<Button.Root onclick={() => count++}>
	Clicked {count} times
</Button.Root>
```

That renders a real native `<button>` with correct semantics, focus behavior, and modality-aware focus data attributes — no styling assumptions baked in.

## Styling

Components are **headless**: they expose state through `data-*` attributes and leave the visuals to you. Style them with plain CSS, Tailwind, or anything else:

```svelte
<Button.Root class="rounded-md bg-black px-3 py-1.5 text-white data-[pressed]:opacity-80">
	Save
</Button.Root>
```

Common state hooks you can target: `data-pressed`, `data-disabled`, `data-focus-visible`, and `data-pending`. Each component's page lists its full data-attribute contract.

## Next steps

- Browse the components in the sidebar — each has a live demo, an anatomy breakdown, and a full API reference.
- Read [Accessibility](/docs/accessibility) to see the standards every component follows.
- Follow the [Releases](/docs/releases) timeline to track what's new.
