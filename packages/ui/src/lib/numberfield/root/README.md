# NumberField.Root

Owns the numeric value, formatted input text, locale-aware parsing, stepping, validation state, and shared context for all NumberField parts.

Use `bind:value` for two-way state. When `name` is provided, Root renders a hidden form input containing the raw numeric value.

## Rounding

Parsed, stepped, and committed values are rounded to the formatter's `maximumFractionDigits` from `formatOptions`. When `formatOptions` does not specify it, the `Intl.NumberFormat` default applies — `3` for plain decimals, the currency's minor units for `style: 'currency'`, and `0` for `style: 'percent'`. Pass an explicit `maximumFractionDigits` if you need to keep more precision than the displayed format.
