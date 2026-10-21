---
'@human-kit/ui': minor
---

TimePicker: typed and stepped times are held inside `minValue`/`maxValue` as they change. A time past the max becomes the max and one before the min becomes the min, at once rather than being left invalid; a first digit waiting for its pair is held once it is completed or its segment is left.
