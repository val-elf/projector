export const getBoundary = (ctx: CanvasRenderingContext2D) => {
	let { width, height } = ctx.canvas;
	const pixels = ctx.getImageData(0, 0, width, height);
	const l = pixels.data.length;
	let top: number,
		left: number,
		right: number,
		bottom: number;
	let x: number,
		y: number;
	for (let i = 0; i < l; i += 4) {
		if (pixels.data[i + 3] !== 0) {
			x = (i / 4) % width;
			y = ~~((i / 4) / width);

			if (top === undefined) top = y;
			if (left === undefined || x < left) left = x;
			if (right === undefined || right < x) right = x;
			if (bottom === undefined || bottom < y) bottom = y;
		}
	}
	if ([left, top, bottom, right].includes(undefined)) return { left: 0, top: 0, width: 0, height: 0 };
	width = right - left;
	height = bottom - top;
	return { top, left, right, bottom, width, height };
}