# Breadcrumbs TODO

## Goal

Track Breadcrumbs work with a single mandatory TODO format.

## Backlog

- [x] [M][P0][Area: Architecture][Owner: Unassigned][Target: Done] Create the `root`, `list`, `item`, `link` and `separator` parts with namespace exports.
- [x] [S][P0][Area: Accessibility][Owner: Unassigned][Target: Done] Render a `<nav>` named "Breadcrumb" in six languages, an `<ol>` of `<li>`, `aria-current="page"` on the current link, and `aria-hidden` separators.
- [x] [S][P1][Area: Accessibility][Owner: Unassigned][Target: Done] Render a `<span>` for a link without an `href` or with `disabled`, out of the tab order.
- [x] [M][P0][Area: Testing][Owner: Unassigned][Target: Done] Add coverage for the landmark, the locale, the current page, the separators, the disabled link, the tab order, and SSR.
- [x] [S][P0][Area: Accessibility][Owner: Unassigned][Target: Done] Keep `role="list"` on the `<ol>` in writing, for the browsers that drop a list with `list-style: none`.
- [x] [M][P2][Area: UX][Owner: Unassigned][Target: Done] Fold the middle of a long trail behind `Breadcrumbs.Ellipsis`, with the first and the last pages in view, and the focus on the first page that comes into view after the press.
