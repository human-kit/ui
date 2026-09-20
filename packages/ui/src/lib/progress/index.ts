import type { ComponentProps } from 'svelte';
import type ProgressIndicatorComponent from './indicator/progress-indicator.svelte';
import type ProgressLabelComponent from './label/progress-label.svelte';
import type ProgressRootComponent from './root/progress-root.svelte';
import type ProgressTrackComponent from './track/progress-track.svelte';
import type ProgressValueComponent from './value/progress-value.svelte';

export * as Progress from './index.parts.js';

export { default as ProgressRoot } from './root/progress-root.svelte';
export { default as ProgressLabel } from './label/progress-label.svelte';
export { default as ProgressTrack } from './track/progress-track.svelte';
export { default as ProgressIndicator } from './indicator/progress-indicator.svelte';
export { default as ProgressValue } from './value/progress-value.svelte';
export type ProgressRootProps = ComponentProps<typeof ProgressRootComponent>;
export type ProgressLabelProps = ComponentProps<typeof ProgressLabelComponent>;
export type ProgressTrackProps = ComponentProps<typeof ProgressTrackComponent>;
export type ProgressIndicatorProps = ComponentProps<typeof ProgressIndicatorComponent>;
export type ProgressValueProps = ComponentProps<typeof ProgressValueComponent>;
export type { ProgressValueState } from './types.js';
export {
	getProgressContext,
	setProgressContext,
	useProgressContext,
	type ProgressContext,
	type ProgressOrientation,
	type ProgressStatus
} from './root/context.js';

import * as ProgressParts from './index.parts.js';
export default ProgressParts;
