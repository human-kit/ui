import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import { expectNoFalseFocusAttributes } from '../test-utils/focus-contract';
import DropzoneTest from './dropzone-test.svelte';

function fileInput() {
	return document.querySelector<HTMLInputElement>('input[type="file"]')!;
}

function pickFiles(input: HTMLInputElement, ...picked: File[]) {
	const transfer = new DataTransfer();
	for (const file of picked) transfer.items.add(file);
	input.files = transfer.files;
	input.dispatchEvent(new Event('change', { bubbles: true }));
}

function dropFiles(target: HTMLElement, ...dropped: File[]) {
	const transfer = new DataTransfer();
	for (const file of dropped) transfer.items.add(file);
	const event = new DragEvent('drop', { bubbles: true });
	Object.defineProperty(event, 'dataTransfer', { value: transfer });
	target.dispatchEvent(event);
}

function dispatchDrag(target: HTMLElement, type: 'dragenter' | 'dragleave') {
	const transfer = new DataTransfer();
	transfer.items.add(new File(['x'], 'x.txt', { type: 'text/plain' }));
	// `relatedTarget` is left null on purpose: WebKit never sets it on drag events.
	const event = new DragEvent(type, { bubbles: true });
	Object.defineProperty(event, 'dataTransfer', { value: transfer });
	target.dispatchEvent(event);
}

describe('Dropzone', () => {
	it('renders a button surface with the hidden file input', () => {
		const screen = render(DropzoneTest);
		const button = screen.getByRole('button', { name: 'Attachments' });

		expect(button.element()?.tagName).toBe('BUTTON');
		expect(button.element()?.getAttribute('data-dropzone-root')).toBe('true');
		expect(fileInput().getAttribute('aria-hidden')).toBe('true');
		expect(fileInput().tabIndex).toBe(-1);
	});

	it('emits picked files from the hidden input', () => {
		const onFilesPicked = vi.fn();
		render(DropzoneTest, { multiple: true, onFilesPicked });

		pickFiles(
			fileInput(),
			new File(['a'], 'a.txt', { type: 'text/plain' }),
			new File(['b'], 'b.txt', { type: 'text/plain' })
		);

		expect(onFilesPicked).toHaveBeenCalledTimes(1);
		const files = onFilesPicked.mock.calls[0]?.[0] as File[];
		expect(files.map((file) => file.name)).toEqual(['a.txt', 'b.txt']);
	});

	it('keeps only the first file when multiple is false', () => {
		const onFilesPicked = vi.fn();
		render(DropzoneTest, { onFilesPicked });

		pickFiles(
			fileInput(),
			new File(['a'], 'a.txt', { type: 'text/plain' }),
			new File(['b'], 'b.txt', { type: 'text/plain' })
		);

		const files = onFilesPicked.mock.calls[0]?.[0] as File[];
		expect(files.map((file) => file.name)).toEqual(['a.txt']);
	});

	it('filters out files that do not match accept', () => {
		const onFilesPicked = vi.fn();
		render(DropzoneTest, { accept: '.pdf,image/*', multiple: true, onFilesPicked });

		pickFiles(
			fileInput(),
			new File(['a'], 'doc.pdf', { type: 'application/pdf' }),
			new File(['b'], 'pic.png', { type: 'image/png' }),
			new File(['c'], 'note.txt', { type: 'text/plain' })
		);

		const files = onFilesPicked.mock.calls[0]?.[0] as File[];
		expect(files.map((file) => file.name)).toEqual(['doc.pdf', 'pic.png']);
	});

	it('opens the picker when the surface is clicked', async () => {
		const screen = render(DropzoneTest);
		const click = vi.spyOn(fileInput(), 'click');

		await screen.getByRole('button', { name: 'Attachments' }).click();

		expect(click).toHaveBeenCalled();
	});

	it('lets the consumer cancel opening the picker via preventDefault', async () => {
		const onClick = vi.fn((event: MouseEvent) => event.preventDefault());
		const screen = render(DropzoneTest, { onClick });
		const click = vi.spyOn(fileInput(), 'click');

		await screen.getByRole('button', { name: 'Attachments' }).click();

		expect(onClick).toHaveBeenCalledTimes(1);
		expect(click).not.toHaveBeenCalled();
	});

	it('emits rejected files when accept filters everything out', () => {
		const onFilesPicked = vi.fn();
		const onFilesRejected = vi.fn();
		const screen = render(DropzoneTest, { accept: 'image/*', onFilesPicked, onFilesRejected });
		const button = screen.getByRole('button', { name: 'Attachments' }).element() as HTMLElement;

		dropFiles(button, new File(['x'], 'note.txt', { type: 'text/plain' }));

		expect(onFilesPicked).not.toHaveBeenCalled();
		expect(onFilesRejected).toHaveBeenCalledTimes(1);
		const rejected = onFilesRejected.mock.calls[0]?.[0] as File[];
		expect(rejected.map((file) => file.name)).toEqual(['note.txt']);
	});

	it('emits rejected files from the hidden input alongside accepted ones', () => {
		const onFilesPicked = vi.fn();
		const onFilesRejected = vi.fn();
		render(DropzoneTest, { accept: 'image/*', multiple: true, onFilesPicked, onFilesRejected });

		pickFiles(
			fileInput(),
			new File(['a'], 'pic.png', { type: 'image/png' }),
			new File(['b'], 'note.txt', { type: 'text/plain' })
		);

		const picked = onFilesPicked.mock.calls[0]?.[0] as File[];
		expect(picked.map((file) => file.name)).toEqual(['pic.png']);
		const rejected = onFilesRejected.mock.calls[0]?.[0] as File[];
		expect(rejected.map((file) => file.name)).toEqual(['note.txt']);
	});

	it('emits dropped files and clears the drop-target state', async () => {
		const onFilesPicked = vi.fn();
		const screen = render(DropzoneTest, { onFilesPicked });
		const button = screen.getByRole('button', { name: 'Attachments' }).element() as HTMLElement;

		dropFiles(button, new File(['x'], 'dropped.txt', { type: 'text/plain' }));

		const files = onFilesPicked.mock.calls[0]?.[0] as File[];
		expect(files.map((file) => file.name)).toEqual(['dropped.txt']);
		expect(button.getAttribute('data-drop-target')).toBeNull();
	});

	it('keeps the drop-target highlight while crossing children (null relatedTarget)', async () => {
		const screen = render(DropzoneTest);
		const button = screen.getByRole('button', { name: 'Attachments' }).element() as HTMLElement;
		const child = button.querySelector('[data-state-dragging]') as HTMLElement;

		dispatchDrag(button, 'dragenter');
		await expect.poll(() => button.getAttribute('data-drop-target')).toBe('true');

		// Entering a child fires dragenter (bubbles) then dragleave on the zone.
		dispatchDrag(child, 'dragenter');
		dispatchDrag(button, 'dragleave');
		await expect.poll(() => button.getAttribute('data-drop-target')).toBe('true');

		// Leaving the zone entirely balances the counter and clears the highlight.
		dispatchDrag(button, 'dragleave');
		await expect.poll(() => button.getAttribute('data-drop-target')).toBeNull();
	});

	it('does not pick or open when disabled', async () => {
		const onFilesPicked = vi.fn();
		const screen = render(DropzoneTest, { disabled: true, onFilesPicked });
		const button = screen.getByRole('button', { name: 'Attachments' });

		expect(button.element()?.hasAttribute('disabled')).toBe(true);
		expect(button.element()?.getAttribute('data-disabled')).toBe('true');

		dropFiles(button.element() as HTMLElement, new File(['x'], 'x.txt', { type: 'text/plain' }));
		expect(onFilesPicked).not.toHaveBeenCalled();
	});

	it('sets focus-visible on keyboard focus', async () => {
		const screen = render(DropzoneTest);
		const button = screen.getByRole('button', { name: 'Attachments' });

		await userEvent.tab();
		await userEvent.tab();

		await expect.poll(() => button.element()?.getAttribute('data-focus-visible')).toBe('true');
		expectNoFalseFocusAttributes(document);
	});

	it('exposes the announcement through a polite live region', () => {
		render(DropzoneTest, { announcement: '2 archivos agregados' });
		const status = document.querySelector('[role="status"]');

		expect(status?.getAttribute('aria-live')).toBe('polite');
		expect(status?.textContent).toBe('2 archivos agregados');
	});
});
