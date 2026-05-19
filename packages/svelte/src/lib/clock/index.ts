import type { ComponentProps } from 'svelte';
import type ClockAxisComponent from './axis/clock-axis.svelte';
import type ClockRootComponent from './root/clock-root.svelte';
import type ClockWheelColumnComponent from './wheel-column/clock-wheel-column.svelte';
import type ClockWheelItemComponent from './wheel-item/clock-wheel-item.svelte';

export * as Clock from './index.parts.js';

export { default as ClockRoot } from './root/clock-root.svelte';
export { default as ClockAxis } from './axis/clock-axis.svelte';
export { default as ClockWheelColumn } from './wheel-column/clock-wheel-column.svelte';
export { default as ClockWheelItem } from './wheel-item/clock-wheel-item.svelte';
export type ClockRootProps = ComponentProps<typeof ClockRootComponent>;
export type ClockAxisProps = ComponentProps<typeof ClockAxisComponent>;
export type ClockWheelColumnProps = ComponentProps<typeof ClockWheelColumnComponent>;
export type ClockWheelItemProps = ComponentProps<typeof ClockWheelItemComponent>;

export {
	getClockContext,
	setClockContext,
	useClockContext,
	type ClockContext,
	type ClockEditableSegmentType
} from './root/context.js';

export {
	type TimePickerGranularity as ClockGranularity,
	type TimePickerHourCycle as ClockHourCycle,
	type TimePickerTimeValue as ClockTimeValue
} from './root/time-utils.js';

export { type ClockColumnInfo } from './root/resolve-visible-columns.js';

import * as ClockParts from './index.parts.js';
export default ClockParts;
