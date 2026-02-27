import type { DatePickerEditableSegmentType } from './date-utils';

export type DatePickerSegmentRefs = Record<DatePickerEditableSegmentType, HTMLElement | null>;

export function createDatePickerSegmentRefs(): DatePickerSegmentRefs {
	return {
		day: null,
		month: null,
		year: null
	};
}

export function registerDatePickerSegmentRef(
	refs: DatePickerSegmentRefs,
	type: DatePickerEditableSegmentType,
	element: HTMLElement | null
): boolean {
	if (refs[type] === element) return false;
	refs[type] = element;
	return true;
}

export function focusDatePickerSegmentByType(
	refs: DatePickerSegmentRefs,
	type: DatePickerEditableSegmentType
): boolean {
	const target = refs[type];
	if (!target) return false;
	target.focus();
	return true;
}

export function focusNextDatePickerSegment(
	refs: DatePickerSegmentRefs,
	segmentOrder: DatePickerEditableSegmentType[],
	type: DatePickerEditableSegmentType
): boolean {
	const index = segmentOrder.indexOf(type);
	if (index < 0) return false;
	for (let nextIndex = index + 1; nextIndex < segmentOrder.length; nextIndex += 1) {
		const nextType = segmentOrder[nextIndex];
		if (focusDatePickerSegmentByType(refs, nextType)) {
			return true;
		}
	}
	return false;
}

export function focusPreviousDatePickerSegment(
	refs: DatePickerSegmentRefs,
	segmentOrder: DatePickerEditableSegmentType[],
	type: DatePickerEditableSegmentType
): boolean {
	const index = segmentOrder.indexOf(type);
	if (index < 0) return false;
	for (let previousIndex = index - 1; previousIndex >= 0; previousIndex -= 1) {
		const previousType = segmentOrder[previousIndex];
		if (focusDatePickerSegmentByType(refs, previousType)) {
			return true;
		}
	}
	return false;
}

export function focusLastDatePickerSegment(
	refs: DatePickerSegmentRefs,
	segmentOrder: DatePickerEditableSegmentType[]
): boolean {
	for (let index = segmentOrder.length - 1; index >= 0; index -= 1) {
		const type = segmentOrder[index];
		if (focusDatePickerSegmentByType(refs, type)) {
			return true;
		}
	}
	return false;
}
