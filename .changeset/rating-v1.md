---
'@human-kit/ui': minor
---

Add the Rating primitive with `Root`, `Label`, `Output` and `Item`. With whole items the root is a radio group, and each item is a radio with its own name, because each value is one item. With `precision={0.5}` the root is a slider with `aria-valuenow` and `aria-valuetext`, because a radio group cannot say 3.5. The keyboard is the same in the two shapes. The arrows step by the precision, `Home` and `End` go to the ends, and `Delete` clears the value. The value follows the pointer before a press, in `Rating.Output` and in `--rating-display-value`. Each item carries `--rating-item-fill`, from 0 to 1, thus one shape over the item gives you a half star. `name` sends the value in a form, and a `<form>` reset takes the first value back.
