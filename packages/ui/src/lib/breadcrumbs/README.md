# Breadcrumbs

## Description

`Breadcrumbs` is the trail of pages above the one the user is on. It is a `<nav>` landmark named "Breadcrumb" with an ordered list of links, and the last one says it is the current page.

## Anatomy

- `Breadcrumbs.Root`
- `Breadcrumbs.List`
- `Breadcrumbs.Item`
- `Breadcrumbs.Link`
- `Breadcrumbs.Ellipsis`
- `Breadcrumbs.Separator`

```svelte
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

## Usage guidelines

- Set `current` on the last link. It can keep its `href`: a link to the page the user is on is a way to reload it.
- Put the separator in the item, after the link, on every item but the last.
- Give the root an `aria-label` when the page has two sets of breadcrumbs.
- Use `disabled` for a page the user cannot open now. The text stays, the link goes.
- Give `maxItems` to fold a long trail, and put a `Breadcrumbs.Ellipsis` after the first item.

## API reference

- `Breadcrumbs.Root`
  - `aria-label?: string` ("Breadcrumb", localized)
  - `maxItems?: number`, `expanded?: boolean` (bindable), `onExpandedChange?: (expanded: boolean) => void`
  - `element?: HTMLElement | null` (bindable)
- `Breadcrumbs.List`, `Breadcrumbs.Item`
  - `element` (bindable)
- `Breadcrumbs.Link`
  - `href?: string`, `current?: boolean`, `disabled?: boolean`
  - `element?: HTMLAnchorElement | HTMLSpanElement | null` (bindable)
- `Breadcrumbs.Ellipsis`
  - `children` (three dots without children), `itemClass?: string`, `separator?: Snippet`, `aria-label?: string` ("Show N more pages", localized)
- `Breadcrumbs.Separator`
  - `children` (a slash without children)

## Accessibility

- `Breadcrumbs.Root` is a `<nav>` with `aria-label="Breadcrumb"`, in the locale of `LocaleProvider`. A screen reader user finds it in the list of landmarks.
- `Breadcrumbs.List` is an `<ol>` of `<li>`: a screen reader says the count and the position of each page. It has `role="list"` in writing, for the browsers that drop a list with `list-style: none`.
- `Breadcrumbs.Link` with `current` has `aria-current="page"`. Without an `href`, or with `disabled`, it is a `<span>`: not a link, and not a tab stop.
- `Breadcrumbs.Separator` is `aria-hidden`. The list already separates the items.
- `Breadcrumbs.Ellipsis` is a button named "Show N more pages". After the press, the focus lands on the first page that comes into view.
- The keyboard moves through the links with `Tab`. Breadcrumbs are links on a page, not a widget with arrow keys.
