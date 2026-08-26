---
title: Quick Start
description: Install @human-kit/ui and render your first accessible component in a couple of minutes.
---

<script>
	import { InstallCommand } from '$lib/docs/components/index.js';
</script>

# Quick Start

`@human-kit/ui` is a set of headless UI components for **Svelte 5**. The components give you the behavior, the semantics, and the keyboard and focus control. You write the styles.

## Installation

<InstallCommand pkg="@human-kit/ui" />

Svelte 5 is a peer dependency. Install it in your project:

<InstallCommand pkg="svelte@^5" />

The package is native ESM, and each component has a subpath export. Thus your bundler includes only the components that you import.

## Your first component

Each component is a set of parts in a namespace. Import the component from the root of the package, or from its subpath:

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

This code makes a true `<button>` element. The element has the correct semantics, the correct focus behavior, and the modality-aware focus data attributes. The component adds no styles.

## Styles

The components are **headless**. Each component shows its state in `data-*` attributes, and each component lets you write all of the styles. Write the styles in plain CSS, in Tailwind, or in a different tool:

```svelte
<Button.Root class="rounded-md bg-black px-3 py-1.5 text-white data-[pressed]:opacity-80">
	Save
</Button.Root>
```

These data attributes are common: `data-pressed`, `data-disabled`, `data-focus-visible`, and `data-pending`. The page for each component gives the full list of its data attributes.

## Next steps

- Look at the components in the side bar. Each component has a live demo, an anatomy section, and a full API reference.
- Read [Accessibility](/docs/accessibility) for the standards that each component obeys.
- Read the [Releases](/docs/releases) page for the changes in each version.
