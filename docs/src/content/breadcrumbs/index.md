---
title: Breadcrumbs
description: The trail of pages above the one the user is on, as a nav landmark with an ordered list of links, the current page marked for the screen reader, separators it does not read, and a fold for a long trail.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Disabled from './demos/disabled.svelte';
	import disabledSource from './demos/disabled.svelte?highlight';
	import Collapsed from './demos/collapsed.svelte';
	import collapsedSource from './demos/collapsed.svelte?highlight';
	import api from './api.json';
</script>

# Breadcrumbs

`Breadcrumbs` is the trail of pages above the one the user is on. It is a `<nav>` landmark named "Breadcrumb" with an ordered list of links, and the last one says it is the current page.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`Breadcrumbs.Root` is the `<nav>` landmark. `Breadcrumbs.List` is the `<ol>`, and each `Breadcrumbs.Item` is an `<li>` with a `Breadcrumbs.Link` in it. `Breadcrumbs.Separator` is the sign after a link, in the item.

```svelte
<script>
	import { Breadcrumbs } from '@human-kit/ui';
</script>

<Breadcrumbs.Root>
	<Breadcrumbs.List>
		<Breadcrumbs.Item>
			<Breadcrumbs.Link href="/">Home</Breadcrumbs.Link>
			<Breadcrumbs.Separator />
		</Breadcrumbs.Item>
		<Breadcrumbs.Item>
			<Breadcrumbs.Link href="/docs">Docs</Breadcrumbs.Link>
			<Breadcrumbs.Separator />
		</Breadcrumbs.Item>
		<Breadcrumbs.Item>
			<Breadcrumbs.Link current>Breadcrumbs</Breadcrumbs.Link>
		</Breadcrumbs.Item>
	</Breadcrumbs.List>
</Breadcrumbs.Root>
```

## The current page

Give `current` to the last link. It gets `aria-current="page"`, and `data-current` for your styles. It can keep its `href`: a link to the page the user is on is a way to reload it. Without an `href`, the link is a `<span>`: plain text, and not a tab stop.

## The separator

`Breadcrumbs.Separator` renders a slash without children, or your own sign. It is `aria-hidden`: the list already separates the items, and a slash read aloud between each two is noise. Put it in the item, after the link, on every item but the last. The list then holds pages only, and the count a screen reader says is the count of pages.

## A disabled link

`disabled` takes the `href` away from a link. The text stays, with `aria-disabled` and `data-disabled`, and the link is out of the tab order on its own. Use it for a page the user cannot open now.

<Demo source={disabledSource}><Disabled /></Demo>

## A long trail

Give `maxItems` to fold the middle of a long trail. The first page and the last `maxItems - 1` stay in view. A `Breadcrumbs.Ellipsis` in the list stands for the rest: put it after the first item. It is a button named "Show N more pages", in the locale of `LocaleProvider`. A press unfolds the trail, and the focus moves to the first page that comes into view. `bind:expanded` reads the state, and folds the trail again.

<Demo source={collapsedSource}><Collapsed /></Demo>

## The name

The landmark is named "Breadcrumb", in the locale of `LocaleProvider`. Give `aria-label` for a name of your own, and always when the page has two sets of breadcrumbs. Two landmarks with one name are one to the screen reader.

## Usage guidelines

- Put the trail near the top of the page, before the main content.
- Keep the page the user is on as the last item. A trail without its end leaves the user to guess where they are.
- Keep the separator out of the last item.
- Use `disabled` and not a missing `href` for a page that exists and is out of reach now: the reader then knows the difference.

## Accessibility

- `Breadcrumbs.Root` is a `<nav>` with `aria-label="Breadcrumb"`, in the locale of `LocaleProvider`. A screen reader user finds it in the list of landmarks, apart from the main navigation.
- `Breadcrumbs.List` is an `<ol>` of `<li>`: a screen reader says the count and the position of each page. It has `role="list"` in writing, for the browsers that drop a list with `list-style: none`.
- `Breadcrumbs.Link` with `current` has `aria-current="page"`. Without an `href`, or with `disabled`, it is a `<span>`: not a link, and not a tab stop.
- `Breadcrumbs.Separator` is `aria-hidden`.
- `Breadcrumbs.Ellipsis` is a button with a name that says how many pages it hides. After the press, the focus lands on the first of them. The button is gone, and a focus left on nothing is a focus lost.
- The keyboard moves through the links with `Tab`. Breadcrumbs are links on a page, not a widget with arrow keys.

## API reference

<ApiReference api={api} />
