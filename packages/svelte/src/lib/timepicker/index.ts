import type { ComponentProps } from 'svelte';
import type TimePickerWheelColumnComponent from '../clock/wheel-column/clock-wheel-column.svelte';
import type TimePickerWheelItemComponent from '../clock/wheel-item/clock-wheel-item.svelte';
import type TimePickerClockComponent from './clock/time-picker-clock.svelte';
import type TimePickerInputComponent from './input/time-picker-input.svelte';
import type TimePickerPopoverComponent from './popover/time-picker-popover.svelte';
import type TimePickerRootComponent from './root/time-picker-root.svelte';
import type TimePickerSegmentComponent from './segment/time-picker-segment.svelte';
import type TimePickerTriggerComponent from './trigger/time-picker-trigger.svelte';

export * as TimePicker from './index.parts.js';

export { default as TimePickerRoot } from './root/time-picker-root.svelte';
export { default as TimePickerInput } from './input/time-picker-input.svelte';
export { default as TimePickerSegment } from './segment/time-picker-segment.svelte';
export { default as TimePickerTrigger } from './trigger/time-picker-trigger.svelte';
export { default as TimePickerPopover } from './popover/time-picker-popover.svelte';
export { default as TimePickerClock } from './clock/time-picker-clock.svelte';
export { default as TimePickerWheelColumn } from '../clock/wheel-column/clock-wheel-column.svelte';
export { default as TimePickerWheelItem } from '../clock/wheel-item/clock-wheel-item.svelte';
export type TimePickerRootProps = ComponentProps<typeof TimePickerRootComponent>;
export type TimePickerInputProps = ComponentProps<typeof TimePickerInputComponent>;
export type TimePickerSegmentProps = ComponentProps<typeof TimePickerSegmentComponent>;
export type TimePickerTriggerProps = ComponentProps<typeof TimePickerTriggerComponent>;
export type TimePickerPopoverProps = ComponentProps<typeof TimePickerPopoverComponent>;
export type TimePickerClockProps = ComponentProps<typeof TimePickerClockComponent>;
export type TimePickerWheelColumnProps = ComponentProps<typeof TimePickerWheelColumnComponent>;
export type TimePickerWheelItemProps = ComponentProps<typeof TimePickerWheelItemComponent>;

export {
	getTimePickerContext,
	setTimePickerContext,
	useTimePickerContext,
	type TimePickerContext,
	type TimePickerOpenChangeDetails,
	type TimePickerOpenChangeReason,
	type TimePickerSegmentPart,
	type TimePickerSegmentType,
	type TimePickerEditableSegmentType
} from './root/context.js';

export {
	type TimePickerGranularity,
	type TimePickerHourCycle,
	type TimePickerTimeValue
} from './root/time-utils.js';

export { type ClockColumnInfo } from '../clock/root/resolve-visible-columns.js';

import * as TimePickerParts from './index.parts.js';
export default TimePickerParts;
