# NumberField.Root

Holds the numeric value, the text in the input, the locale, the steps, and the validation state. It gives the shared context to each NumberField part.

Use `bind:value` for two-way state. When `name` is provided, Root renders a hidden form input containing the raw numeric value.

## Rounding

Parsed, stepped, and committed values are rounded to the formatter's `maximumFractionDigits` from `formatOptions`. When `formatOptions` does not specify it, the `Intl.NumberFormat` default applies — `3` for plain decimals, the currency's minor units for `style: 'currency'`, and `0` for `style: 'percent'`. Pass an explicit `maximumFractionDigits` if you need to keep more precision than the displayed format.
