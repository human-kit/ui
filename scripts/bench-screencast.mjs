/**
 * Blank-band measurement from real compositor output.
 *
 * The in-page probe cannot see this symptom. It samples from
 * `requestAnimationFrame`, i.e. from the main thread — but the blank band
 * appears precisely while the main thread is blocked building rows and the
 * compositor scrolls the layer on its own. By the time rAF runs again the DOM
 * is already repaired, so the probe always reports zero.
 *
 * `Page.startScreencast` delivers the frames the compositor actually presents,
 * independent of main-thread state, so it observes what the user sees.
 */

/** Pixels at or above this channel value count as background. */
const BACKGROUND_THRESHOLD = 244;
/** A scanline is "empty" when at least this share of its pixels is background. */
const EMPTY_LINE_RATIO = 0.985;

/**
 * Counts, per frame, the height in CSS px of the uninterrupted background band
 * at the bottom of the table body — the gap where rows should be but are not.
 *
 * Analysis runs inside a scratch page: decoding JPEG in Node would need a
 * dependency, while the browser already has an image decoder and a canvas.
 */
export async function measureBlankBand({ page, cdp, analyzer, region, drive }) {
	const frames = [];
	const onFrame = async (frame) => {
		frames.push(frame.data);
		try {
			await cdp.send('Page.screencastFrameAck', { sessionId: frame.sessionId });
		} catch {
			/* screencast already stopped */
		}
	};

	cdp.on('Page.screencastFrame', onFrame);
	await cdp.send('Page.startScreencast', {
		format: 'jpeg',
		quality: 80,
		everyNthFrame: 1
	});

	try {
		await drive();
	} finally {
		await cdp.send('Page.stopScreencast').catch(() => undefined);
		cdp.off('Page.screencastFrame', onFrame);
	}

	if (frames.length === 0) {
		return { frames: 0, blankFrameRatio: 0, maxBlankPx: 0, meanBlankPx: 0 };
	}

	const blankPxPerFrame = await analyzer.evaluate(
		async ({ images, region, backgroundThreshold, emptyLineRatio }) => {
			const results = [];

			for (const dataUrl of images) {
				const bitmap = await createImageBitmap(
					await (await fetch(`data:image/jpeg;base64,${dataUrl}`)).blob()
				);
				const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
				const context = canvas.getContext('2d', { willReadFrequently: true });
				context.drawImage(bitmap, 0, 0);

				// The screencast frame is capped to the device viewport, so map CSS
				// px onto it rather than assuming a 1:1 scale.
				const scale = bitmap.width / region.viewportWidth;
				const left = Math.round(region.left * scale);
				const width = Math.round(region.width * scale);
				const top = Math.round(region.top * scale);
				const bottom = Math.min(bitmap.height, Math.round(region.bottom * scale));
				if (width <= 0 || bottom <= top) {
					results.push(0);
					bitmap.close();
					continue;
				}

				const { data } = context.getImageData(left, top, width, bottom - top);
				let emptyLines = 0;

				// Walk up from the bottom edge: the gap always grows from there,
				// because the virtualizer falls behind the scroll direction.
				for (let y = bottom - top - 1; y >= 0; y -= 1) {
					let backgroundPixels = 0;
					for (let x = 0; x < width; x += 1) {
						const offset = (y * width + x) * 4;
						if (
							data[offset] >= backgroundThreshold &&
							data[offset + 1] >= backgroundThreshold &&
							data[offset + 2] >= backgroundThreshold
						) {
							backgroundPixels += 1;
						}
					}
					if (backgroundPixels / width < emptyLineRatio) break;
					emptyLines += 1;
				}

				bitmap.close();
				results.push(emptyLines / scale);
			}

			return results;
		},
		{
			images: frames,
			region,
			backgroundThreshold: BACKGROUND_THRESHOLD,
			emptyLineRatio: EMPTY_LINE_RATIO
		}
	);

	// A couple of scanlines of background are just the last row's border and
	// antialiasing; only a real band counts as a gap.
	const meaningful = blankPxPerFrame.filter((value) => value > 4);
	const total = blankPxPerFrame.reduce((sum, value) => sum + value, 0);

	const worstIndex = blankPxPerFrame.indexOf(Math.max(...blankPxPerFrame));

	return {
		frames: blankPxPerFrame.length,
		blankFrameRatio: meaningful.length / blankPxPerFrame.length,
		maxBlankPx: Math.round(Math.max(0, ...blankPxPerFrame)),
		meanBlankPx: Math.round(total / blankPxPerFrame.length),
		// The frame that scored worst, so the measurement can be eyeballed
		// instead of trusted. Written to disk by the runner when --save-frames
		// is passed; a metric this easy to get subtly wrong needs to be checkable.
		worstFrameJpegBase64: frames[worstIndex]
	};
}
