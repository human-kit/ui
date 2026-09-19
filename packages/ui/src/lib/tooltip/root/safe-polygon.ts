/**
 * The area the pointer may cross between the trigger and the content of a tooltip.
 *
 * The pointer leaves the trigger toward the content, and for a moment it is on neither: it is in
 * the gap. A tooltip that closes there is one the user cannot reach. The area is a triangle from
 * the point where the pointer left the trigger to the two corners of the content on the edge
 * that faces the trigger, a little wider than the content. A pointer inside it is on its way; a
 * pointer outside it went somewhere else.
 */

export type Point = { x: number; y: number };

export type Rect = { left: number; top: number; right: number; bottom: number };

export type Side = 'top' | 'bottom' | 'left' | 'right';

/** How much wider than the content the far edge of the triangle is, in pixels, on each side. */
export const SAFE_POLYGON_PADDING = 8;

export function buildSafePolygon(
	exit: Point,
	content: Rect,
	side: Side,
	padding = SAFE_POLYGON_PADDING
): Point[] {
	switch (side) {
		case 'top':
			return [
				exit,
				{ x: content.left - padding, y: content.bottom },
				{ x: content.right + padding, y: content.bottom }
			];
		case 'bottom':
			return [
				exit,
				{ x: content.left - padding, y: content.top },
				{ x: content.right + padding, y: content.top }
			];
		case 'left':
			return [
				exit,
				{ x: content.right, y: content.top - padding },
				{ x: content.right, y: content.bottom + padding }
			];
		case 'right':
			return [
				exit,
				{ x: content.left, y: content.top - padding },
				{ x: content.left, y: content.bottom + padding }
			];
	}
}

/** Whether a point is inside a polygon, by the crossing number. A point on an edge counts. */
export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
	let inside = false;
	for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
		const a = polygon[i];
		const b = polygon[j];
		if (isPointOnSegment(point, a, b)) return true;
		const crosses =
			a.y > point.y !== b.y > point.y &&
			point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;
		if (crosses) inside = !inside;
	}
	return inside;
}

function isPointOnSegment(point: Point, a: Point, b: Point): boolean {
	const cross = (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x);
	if (Math.abs(cross) > 0.5) return false;
	return (
		point.x >= Math.min(a.x, b.x) - 0.5 &&
		point.x <= Math.max(a.x, b.x) + 0.5 &&
		point.y >= Math.min(a.y, b.y) - 0.5 &&
		point.y <= Math.max(a.y, b.y) + 0.5
	);
}

export function isPointInRect(point: Point, rect: Rect): boolean {
	return (
		point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom
	);
}
