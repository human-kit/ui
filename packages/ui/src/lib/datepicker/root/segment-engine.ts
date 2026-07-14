import type { DatePickerDateValue, DatePickerSegmentPart } from './date-utils';
import {
	clampSegment,
	clampSegmentDraft,
	getSegmentMaxValue,
	getSegmentNumericValue,
	normalizeSegmentInput,
	type DatePickerSegmentDraft,
	type EditableSegmentType
} from './segment-state';

/**
 * Shared date segment engine used by both DatePicker and DateRangePicker.
 *
 * Each engine instance drives the segment machinery for one editable date
 * (the DatePicker has a single instance; the DateRangePicker creates one per
 * range part). All state stays in the owning root component and is reached
 * through the adapter, so Svelte reactivity keeps working untouched.
 */
export type DateSegmentEngineAdapter = {
	/** Whether editing is currently allowed (not disabled and not readonly). */
	isEditable: () => boolean;
	/** Current segment draft (day/month/year strings) for this date. */
	getDraft: () => DatePickerSegmentDraft;
	setDraft: (draft: DatePickerSegmentDraft) => void;
	/** Multi-digit typing buffer for this date. */
	getTypeBuffer: () => DatePickerSegmentDraft;
	setTypeBuffer: (buffer: DatePickerSegmentDraft) => void;
	/** Committed value used as the base for arrow stepping on empty segments. */
	getCommittedValue: () => DatePickerDateValue | null;
	/**
	 * Called after every draft mutation. The owner evaluates the draft(s) and
	 * either commits a value or clears the published value; this is the one
	 * place where DatePicker (single draft) and DateRangePicker (both drafts
	 * must be commitable) genuinely differ.
	 */
	commitDraft: () => void;
};

export type DateSegmentEngine = {
	getSegmentValue: (type: EditableSegmentType) => string;
	setSegmentValue: (type: EditableSegmentType, nextValue: string) => void;
	typeSegmentDigit: (type: EditableSegmentType, digit: string) => boolean;
	adjustSegmentValue: (type: EditableSegmentType, step: number) => void;
	/** Draft-aware maximum for the segment (e.g. day max follows month/year). */
	getSegmentValueMax: (type: EditableSegmentType) => number;
	/** Clears the typing buffer for one segment (e.g. when it loses focus). */
	clearTypeBuffer: (type: EditableSegmentType) => void;
};

export function createDateSegmentEngine(adapter: DateSegmentEngineAdapter): DateSegmentEngine {
	function getSegmentValue(type: EditableSegmentType): string {
		return adapter.getDraft()[type];
	}

	function setSegmentValueInternal(
		type: EditableSegmentType,
		nextValue: string,
		fromTyping: boolean
	) {
		if (!adapter.isEditable()) return;

		const rawNumericLength = nextValue.replace(/\D/g, '').length;
		const normalized = normalizeSegmentInput(type, nextValue);
		const unconstrainedDraft = {
			...adapter.getDraft(),
			[type]: normalized
		};
		const nextDraft = clampSegmentDraft(unconstrainedDraft, type, fromTyping, rawNumericLength);
		adapter.setDraft(nextDraft);
		if (!fromTyping) {
			adapter.setTypeBuffer({ ...adapter.getTypeBuffer(), [type]: '' });
		}

		adapter.commitDraft();
	}

	function setSegmentValue(type: EditableSegmentType, nextValue: string) {
		setSegmentValueInternal(type, nextValue, false);
	}

	function typeSegmentDigit(type: EditableSegmentType, digit: string): boolean {
		if (!/^\d$/.test(digit)) return false;
		const maxLength = type === 'year' ? 4 : 2;
		const previous = adapter.getTypeBuffer()[type];
		let next = `${previous}${digit}`.slice(-maxLength);
		// When appending the digit would overflow the segment's maximum (e.g.
		// typing 5 after 3 in the day segment), the digit starts a new entry
		// instead of being clamped, mirroring React Aria's date field behavior.
		if (next.length > 1 && Number(next) > getSegmentMaxValue(type, adapter.getDraft())) {
			next = digit;
		}
		adapter.setTypeBuffer({ ...adapter.getTypeBuffer(), [type]: next });
		setSegmentValueInternal(type, next, true);

		let didComplete = next.length >= maxLength;
		if (!didComplete && next.length === 1) {
			const firstDigit = Number(next);
			if (type === 'day' && firstDigit >= 4) {
				didComplete = true;
			}
			if (type === 'month' && firstDigit >= 2) {
				didComplete = true;
			}
		}

		if (didComplete) {
			adapter.setTypeBuffer({ ...adapter.getTypeBuffer(), [type]: '' });
		}
		return didComplete;
	}

	function adjustSegmentValue(type: EditableSegmentType, step: number) {
		if (!adapter.isEditable()) return;
		const current = getSegmentNumericValue(type, adapter.getDraft(), adapter.getCommittedValue());
		const next = clampSegment(type, current + step);
		setSegmentValue(type, `${next}`);
	}

	function getSegmentValueMax(type: EditableSegmentType): number {
		return getSegmentMaxValue(type, adapter.getDraft());
	}

	function clearTypeBuffer(type: EditableSegmentType) {
		adapter.setTypeBuffer({ ...adapter.getTypeBuffer(), [type]: '' });
	}

	return {
		getSegmentValue,
		setSegmentValue,
		typeSegmentDigit,
		adjustSegmentValue,
		getSegmentValueMax,
		clearTypeBuffer
	};
}

/**
 * Overlays a segment draft on top of the locale's base segments: empty draft
 * entries render (and flag) their placeholder, filled entries render exactly
 * what the user typed.
 */
export function applyDraftToSegments(
	baseSegments: DatePickerSegmentPart[],
	draft: DatePickerSegmentDraft
): DatePickerSegmentPart[] {
	return baseSegments.map((segment) => {
		if (segment.type === 'literal') return segment;
		const draftValue = draft[segment.type];
		if (draftValue.length === 0) {
			return {
				...segment,
				value: '',
				text: segment.placeholder,
				isPlaceholder: true
			};
		}
		return {
			...segment,
			value: draftValue,
			text: draftValue,
			isPlaceholder: false
		};
	});
}
