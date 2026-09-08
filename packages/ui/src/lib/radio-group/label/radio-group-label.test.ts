import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import RadioGroupLabelOrphanTest from './radio-group-label-orphan-test.svelte';
import RadioGroupLabelTest from './radio-group-label-test.svelte';

function getGroup() {
	return document.querySelector<HTMLElement>('[data-testid="radio-group"]')!;
}

function getLabel(testId = 'radio-group-label') {
	return document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!;
}

describe('RadioGroup.Label', () => {
	it('names the group', async () => {
		const screen = render(RadioGroupLabelTest);

		await expect.poll(() => getGroup().getAttribute('aria-labelledby')).toBe(getLabel().id);
		await expect.element(screen.getByRole('radiogroup', { name: 'Colors' })).toBeInTheDocument();
	});

	// Two labels read as one name, in the order they appear, the same as `Dialog.Title`.
	it('joins the ids of every label', async () => {
		render(RadioGroupLabelTest, { showSecondLabel: true });

		await expect
			.poll(() => getGroup().getAttribute('aria-labelledby'))
			.toBe(`${getLabel().id} ${getLabel('radio-group-label-2').id}`);
	});

	// An `aria-labelledby` on the root is the answer of the caller, thus it stands.
	it('keeps an aria-labelledby that the caller gives', async () => {
		render(RadioGroupLabelTest, { ariaLabelledBy: 'outside-label' });

		await expect.poll(() => getGroup().getAttribute('aria-labelledby')).toBe('outside-label');
	});

	it('drops the name when the label leaves the tree', async () => {
		render(RadioGroupLabelTest);

		await expect.poll(() => getGroup().getAttribute('aria-labelledby')).toBe(getLabel().id);

		await userEvent.click(document.querySelector<HTMLButtonElement>('[data-remove-label]')!);

		await expect.poll(() => getGroup().getAttribute('aria-labelledby')).toBeNull();
	});

	it('rejects a label with no group', () => {
		expect(() => render(RadioGroupLabelOrphanTest)).toThrowError(
			/must be used within RadioGroup.Root/
		);
	});
});
