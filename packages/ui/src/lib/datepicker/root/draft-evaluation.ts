import type { DatePickerDateValue } from './date-utils';
import { getCandidateValueFromDraft, type DatePickerSegmentDraft } from './segment-state';

export type DatePickerDraftStatus =
	'empty' | 'incomplete' | 'invalid' | 'out-of-range' | 'unavailable' | 'valid';

export type DatePickerDraftEvaluation = {
	status: DatePickerDraftStatus;
	/**
	 * The date the segments spell, or `null` when they don't spell one yet (empty,
	 * half-typed, or something like 31/02). A date the bounds reject still lands here —
	 * it exists, it's just not selectable — so a consumer can choose between publishing
	 * it as an invalid selection and discarding it. `isCommitable` is the gate for that
	 * choice; it stays false for a rejected date.
	 */
	value: DatePickerDateValue | null;
	isCommitable: boolean;
	isInvalid: boolean;
};

function isDraftEmpty(draft: DatePickerSegmentDraft): boolean {
	return draft.day.length === 0 && draft.month.length === 0 && draft.year.length === 0;
}

function isDraftIncomplete(draft: DatePickerSegmentDraft): boolean {
	return draft.day.length === 0 || draft.month.length === 0 || draft.year.length === 0;
}

export function evaluateDatePickerDraft(
	draft: DatePickerSegmentDraft,
	options: {
		isDateOutOfRange: (value: DatePickerDateValue) => boolean;
		isDateUnavailable: (value: DatePickerDateValue) => boolean;
	}
): DatePickerDraftEvaluation {
	if (isDraftEmpty(draft)) {
		return {
			status: 'empty',
			value: null,
			isCommitable: false,
			isInvalid: false
		};
	}

	if (isDraftIncomplete(draft)) {
		return {
			status: 'incomplete',
			value: null,
			isCommitable: false,
			isInvalid: true
		};
	}

	const candidate = getCandidateValueFromDraft(draft);
	if (!candidate) {
		return {
			status: 'invalid',
			value: null,
			isCommitable: false,
			isInvalid: true
		};
	}

	if (options.isDateOutOfRange(candidate)) {
		return {
			status: 'out-of-range',
			value: candidate,
			isCommitable: false,
			isInvalid: true
		};
	}

	if (options.isDateUnavailable(candidate)) {
		return {
			status: 'unavailable',
			value: candidate,
			isCommitable: false,
			isInvalid: true
		};
	}

	return {
		status: 'valid',
		value: candidate,
		isCommitable: true,
		isInvalid: false
	};
}
