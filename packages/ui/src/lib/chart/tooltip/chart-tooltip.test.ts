import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import PartsTest from '../area/parts-test.svelte';

const points = () => [...document.querySelectorAll<SVGCircleElement>('[data-point]')];
const tooltip = () => document.querySelector<HTMLElement>('[data-tooltip]');
const position = () => [parseFloat(tooltip()!.style.left), parseFloat(tooltip()!.style.top)];

/** Moves the pointer to a position in the plot, in pixels from its top left corner. */
async function hoverAt(x: number, y: number) {
	await userEvent.hover(document.querySelector('svg')!, { position: { x, y } });
	await tick();
}

describe('Chart.Tooltip', () => {
	it('stays at the point when it does not follow the pointer', async () => {
		render(PartsTest);
		const point = points()[4];
		const [cx, cy] = [Number(point.getAttribute('cx')), Number(point.getAttribute('cy'))];
		await hoverAt(cx + 20, cy + 10);
		expect(position()[0]).toBeCloseTo(cx, 0);
	});

	it('moves with the pointer when it follows it', async () => {
		render(PartsTest, { follow: true });
		const point = points()[4];
		const [cx, cy] = [Number(point.getAttribute('cx')), Number(point.getAttribute('cy'))];
		await hoverAt(cx + 20, cy + 10);
		expect(position()[0]).toBeCloseTo(cx + 20, 0);
		// The title is above the plot, in the figure that the tooltip is positioned in.
		const above =
			document.querySelector('svg')!.getBoundingClientRect().top -
			document.querySelector('figure')!.getBoundingClientRect().top;
		// Only along: at the height of the point, not of the pointer.
		expect(position()[1]).toBeCloseTo(above + cy - 8, 0);

		await hoverAt(cx + 24, cy + 10);
		expect(position()[0]).toBeCloseTo(cx + 24, 0);
	});

	it('follows the pointer past the edges of the figure, in the width of the page', async () => {
		render(PartsTest, { follow: true, wide: true });
		const figure = document.querySelector('figure')!.getBoundingClientRect();
		const point = points()[5];
		await hoverAt(Number(point.getAttribute('cx')), Number(point.getAttribute('cy')));
		const box = tooltip()!.getBoundingClientRect();
		// Wider than the figure, centred on the pointer near its right edge: it goes past the edge.
		expect(box.right).toBeGreaterThan(figure.right);
		expect(box.right).toBeLessThanOrEqual(document.documentElement.clientWidth + 0.5);
	});

	it('follows the pointer only as far as the box that cuts it', async () => {
		const { container } = render(PartsTest, { follow: true, wide: true });
		container.style.cssText = 'overflow: hidden; width: 320px; padding: 0 10px';
		const clip = container.getBoundingClientRect();
		const point = points()[5];
		await hoverAt(Number(point.getAttribute('cx')), Number(point.getAttribute('cy')));
		expect(tooltip()!.getBoundingClientRect().right).toBeLessThanOrEqual(clip.right + 0.5);
	});

	it('keeps the tooltip of the focused point at the point when it follows the pointer', async () => {
		render(PartsTest, { follow: true });
		// The pointer was in the plot and left it: the focus has no pointer to follow.
		await hoverAt(10, 10);
		await userEvent.unhover(document.querySelector('svg')!);
		await userEvent.hover(document.querySelector('figcaption')!);
		points()[0].focus();
		await userEvent.keyboard('{ArrowRight}');
		const point = points()[1];
		expect(position()[0]).toBeCloseTo(Number(point.getAttribute('cx')), 0);
	});

	it('closes when the focus goes from a point to another element in the plot', async () => {
		render(PartsTest);
		const svg = document.querySelector('svg')!;
		const box = document.createElementNS(svg.namespaceURI, 'foreignObject');
		box.setAttribute('width', '40');
		box.setAttribute('height', '20');
		const button = document.createElement('button');
		box.append(button);
		svg.append(box);
		points()[0].focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(tooltip()).not.toBeNull();

		button.focus();
		await tick();
		expect(points()[1].hasAttribute('data-focused')).toBe(false);
		expect(points()[1].hasAttribute('data-focus-visible')).toBe(false);
		await expect.poll(() => tooltip()).toBeNull();
	});

	it('stays in its place while an animation of transform closes it', async () => {
		const style = document.createElement('style');
		style.textContent = `
			@keyframes out { to { transform: scale(0.9) } }
			[data-tooltip][data-exiting] { animation: out 400ms }
		`;
		document.head.append(style);
		try {
			render(PartsTest);
			points()[0].focus();
			await userEvent.keyboard('{ArrowRight}');
			const open = tooltip()!.getBoundingClientRect();
			await userEvent.keyboard('{Escape}');
			const closing = tooltip()!.getBoundingClientRect();
			expect(closing.left + closing.width / 2).toBeCloseTo(open.left + open.width / 2, 0);
			expect(closing.bottom).toBeLessThanOrEqual(open.bottom + 0.5);
		} finally {
			style.remove();
		}
	});

	it('marks the opening for CSS, and closes after the animation of the closing', async () => {
		const style = document.createElement('style');
		style.textContent = `
			@keyframes out { to { opacity: 0 } }
			[data-tooltip][data-exiting] { animation: out 200ms }
		`;
		document.head.append(style);
		try {
			render(PartsTest);
			points()[0].focus();
			await userEvent.keyboard('{ArrowRight}');
			// No animation opens it, thus the attribute of the opening goes at once.
			await new Promise((resolve) => setTimeout(resolve, 0));
			expect(tooltip()!.hasAttribute('data-entering')).toBe(false);

			await userEvent.keyboard('{Escape}');
			expect(tooltip()!.hasAttribute('data-exiting')).toBe(true);
			await expect.poll(() => tooltip(), { timeout: 1000 }).toBeNull();
		} finally {
			style.remove();
		}
	});
});
