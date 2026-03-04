// Canonical source lives in clock/root/time-utils.ts.
// This barrel re-exports everything so existing TimePicker imports keep working.
export {
	type TimePickerGranularity,
	type TimePickerHourCycle,
	type TimePickerTimeValue,
	type TimePickerSegmentType,
	type TimePickerEditableSegmentType,
	type TimePickerSegmentPart,
	type TimePickerDraft,
	type TimeParts,
	createEmptyTimePickerDraft,
	isValidTimePickerValue,
	parseTimePickerValue,
	formatTimePickerValue,
	toDraftFromTimeValue,
	getRequiredSegments,
	normalizeSegmentNumberInput,
	isSegmentValueEmpty,
	buildTimePartsFromDraft,
	compareTimeParts,
	isTimeOutOfRange,
	clampToStep,
	adjustSegmentWithStep,
	buildTimePickerSegments,
	getEditableSegmentOrder,
	getSegmentLabel
} from '../../clock/root/time-utils';
