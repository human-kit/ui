---
'@human-kit/ui': minor
---

Add the Breadcrumbs primitive with `Root`, `List`, `Item`, `Link` and `Separator`. The root is a `<nav>` landmark named "Breadcrumb" in the locale of `LocaleProvider`, the list is an `<ol>` of `<li>`, and `current` gives the last link `aria-current="page"`. A link without an `href`, or with `disabled`, is a `<span>` out of the tab order. The separator is `aria-hidden`, in the item after the link, thus the list holds pages only.
