const bilinearInterpolation = (src, dst) => {
	function interpolate(k, kMin, kMax, vMin, vMax) {
		return Math.round((k - kMin) * vMax + (kMax - k) * vMin)
	}

	function interpolateHorizontal(offset, x, y, xMin, xMax) {
		const vMin = src.data[((y * src.width + xMin) * 4) + offset]
		if (xMin === xMax) return vMin

		const vMax = src.data[((y * src.width + xMax) * 4) + offset]
		return interpolate(x, xMin, xMax, vMin, vMax)
	}

	function interpolateVertical(offset, x, xMin, xMax, y, yMin, yMax) {
		const vMin = interpolateHorizontal(offset, x, yMin, xMin, xMax)
		if (yMin === yMax) return vMin

		const vMax = interpolateHorizontal(offset, x, yMax, xMin, xMax)
		return interpolate(y, yMin, yMax, vMin, vMax)
	}

	let pos = 0

	for (let y = 0; y < dst.height; y++) {
		for (let x = 0; x < dst.width; x++) {
			const srcX = x * src.width / dst.width
			const srcY = y * src.height / dst.height

			const xMin = Math.floor(srcX)
			const yMin = Math.floor(srcY)

			const xMax = Math.min(Math.ceil(srcX), src.width - 1)
			const yMax = Math.min(Math.ceil(srcY), src.height - 1)

			dst.data[pos++] = interpolateVertical(0, srcX, xMin, xMax, srcY, yMin, yMax) // R
			dst.data[pos++] = interpolateVertical(1, srcX, xMin, xMax, srcY, yMin, yMax) // G
			dst.data[pos++] = interpolateVertical(2, srcX, xMin, xMax, srcY, yMin, yMax) // B
			dst.data[pos++] = interpolateVertical(3, srcX, xMin, xMax, srcY, yMin, yMax) // A
		}
	}
	return dst;
}

const colorQuant = (ca, a0, cb, ak, ar) => {
	let qa = (ca * a0 + cb * ak) / ar;
	if (qa > 255) qa = 255;
	return qa & 0xFF;
}

const toRgb = color => ({ r: color & 0xFF, g: (color >> 8) & 0xFF, b: (color >> 16) & 0xFF });

const addPixelColor = (dest, source, a0, ak) => {
	const { r: dr, g: dg, b: db } = toRgb(dest);
	const { r: sr, g: sg, b: sb } = toRgb(source);
	let ar = a0 + ak;// if (ar > 1) { ar = 1; ak = ar - a0; }
	const alpha = Math.round(ar * 255);
	const res = colorQuant(dr, a0, sr, ak, ar) |
		colorQuant(dg, a0, sg, ak, ar) << 8 |
		colorQuant(db, a0, sb, ak, ar) << 16 |
		alpha << 24;
	return res;
}

const q = a => a * a;

const _fillMicroSpot = (rad, hardness, roundness, rotate, color) => {
	const segS = a => q(rad) / 2 * (a - Math.sin(a));
	const res = new ImageData(3, 3);
	const cl = Object.assign({}, color, { a: color.a });
	const dt = res.data;
	let k = rad < 0.5 ? Math.PI * rad * rad : 1;
	dt[16] = cl.r;
	dt[17] = cl.g;
	dt[18] = cl.b;
	dt[19] = cl.a * 255 * k * (0.25 + hardness * 0.75);
	if (rad > 0.5 && rad <= 1.5) {
		const a = Math.sqrt(q(rad) - 0.25);
		let s1, s2;
		if (a < 0.5) {
			s1 = 0;
			const m = Math.acos(0.5 / rad) * 2;
			s2 = segS(m);
		} else {
			const n = 2 * Math.asin(a / rad) - Math.PI / 2;
			const m = Math.PI / 2 - n;
			const side = a - 0.5;
			s1 = q(side) / 2 + segS(n);
			s2 = side + segS(m);
		}
		for (let i = 0; i < 9; i++) {
			const c = i * 4;
			dt[c] = cl.r;
			dt[c + 1] = cl.g;
			dt[c + 2] = cl.b;
			if (i === 4) continue;
			let a = cl.a * 255;
			k = hardness;
			if (i % 2 === 0) {
				k *= s1;
			} else {
				k *= s2;
			}
			dt[c + 3] = Math.round(a * k);
		}
	}
	return res;
}

const _fillSpot = (rad, hardness, roundness, rotate, color) => {
	hardness *= 0.95;
	rad *= 2 - hardness;
	let rad1 = rad;
	let rad2 = rad1 * roundness;

	if (rad1 < 1.5) return _fillMicroSpot(rad, hardness, roundness, rotate, color);

	const width = Math.ceil(rad * 2);
	const res = new ImageData(width, width);

	const getOpacity = (x, y) => {
		const e2 = 1 - q(rad2) / q(rad1);
		const dx = q(rad - x);
		const dy = q(rad - y);
		const d = Math.sqrt(dx + dy);
		const cosa = (rad - x) / d;
		const sina = (rad - y) / d;
		const cosr = Math.cos(rotate);
		const sinr = Math.sin(rotate);
		const cost = cosa * cosr + sina * sinr;

		const rd = rad2 / Math.sqrt(1 - e2 * q(cost));
		const bsize = rd * hardness;

		const ps = d - bsize;
		const lt = rd - bsize;
		if (d <= bsize && bsize > 1) return 1;
		let dst = bsize - d <= 0 ? 0 : 1;
		if (ps > 0 && ps < lt) {
			dst = 1 / (10 * ps / lt + 0.916) - 0.0917;
		} else if (d === 0 && bsize < 1) {
			dst = bsize;
		}
		return dst;
	}

	for (let j = 0; j < width; j++) {
		for (let i = 0; i < width; i++) {
			const c = (j * width + i) * 4;
			const dst = getOpacity(i + 0.5, j + 0.5);
			let opacity = Math.round(dst * color.a * 255);
			if (opacity === 0) continue;
			res.data[c] = color.r;
			res.data[c + 1] = color.g;
			res.data[c + 2] = color.b;
			res.data[c + 3] = opacity;
		}
	}
	return res;
}

const paintSpot = (spot, color) => {
	for (var j = 0; j < spot.height; j++) {
		for (var i = 0; i < spot.width; i++) {
			const c = (j * spot.width + i) * 4;
			if (spot.data[c + 3] === 0) continue;
			spot.data[c] = color.r;
			spot.data[c + 1] = color.g;
			spot.data[c + 2] = color.b;
			spot.data[c + 3] = spot.data[c + 3] * color.a;
		}
	}
}

const getStrong = (strong, stepRatio) => {
	let res = 1 - Math.pow(1 - strong, stepRatio);
	return Math.round(res * 100) / 100;
}

export class BrushManager {
	spotsSamples = {};

	scaleSpot(spot, newX, newY) {
		const res = new ImageData(newX, newY);
		bilinearInterpolation(spot, res);
		return res;
	}

	rotateSpot (spot, rotate) {

	}

	fillSpot(rad, hardness, roundness, rotate, color) {
		const white = { r: 255, g: 255, b: 255, a: 1 };
		const cut = r => Math.round(r * 100) / 100;
		rad = cut(rad);
		roundness = cut(roundness);
		hardness = cut(hardness);
		rotate = cut(rotate);

		const key = `${rad}-${hardness}-${roundness}-${rotate}`;
		let sample;
		if (!this.spotsSamples[key]) {
			sample = _fillSpot(rad, hardness, roundness, rotate, white);
			this.spotsSamples[key] = sample;
		} else sample = this.spotsSamples[key];
		const res = new ImageData(new Uint8ClampedArray(sample.data), sample.width, sample.height);
		paintSpot(res, color);
		return res;
	}

	getSpot (rad, hardness, roundness, rotate, color) {
		return this.fillSpot(rad, hardness, roundness, rotate, color);
	}

	drawTo (dest, source, pos, smooth = false) {
		const ddata = new Uint32Array(dest.data.buffer);
		const sdata = new Uint32Array(source.data.buffer);
		const fillLoc = (dl, scolor, a0, ak) => {
			ddata[dl] = addPixelColor(ddata[dl], scolor, a0, ak);
		};

		for (let j = 0; j < source.height; j++) {
			let cy = Math.floor(pos.y);
			let sy = Math.round((pos.y - cy) * 10) / 10;
			if (sy === 1) { cy++; sy = 0; }
			const ry = cy + j;

			if (ry < 0) continue;
			if (ry > dest.height) return;

			for (let i = 0; i < source.width; i++) {
				const sl = j * source.width + i;
				const scolor = sdata[sl];
				const a1 = (scolor >> 24 & 0xFF) / 255;
				if (a1 === 0) continue;

				let cx = Math.floor(pos.x);
				let sx = Math.round((pos.x - cx) * 10) / 10;
				if (sx === 1) { cx++; sx = 0; }
				const rx = cx + i;

				if (rx > dest.width || rx < 0) continue;

				let dl = rx + ry * dest.width;
				if (dl > ddata.length) continue;

				let a0 = (ddata[dl] >> 24 & 0xFF) / 255;
				if (smooth && (sx > 0 || sy > 0)) {
					let ax = a1 * (1 - sx) * (1 - sy);
					let ak = ax * (1 - a0);

					fillLoc(dl, scolor, a0, ak);
					if (sx > 0) {
						a0 = (ddata[dl + 1] >> 24 & 0xFF) / 255;
						ax = a1 * sx * (1 - sy);
						ak = ax * (1 - a0);
						fillLoc(dl + 1, scolor, a0, ak);
					}

					if (sy > 0) {
						dl += dest.width;
						a0 = (ddata[dl] >> 24 & 0xFF) / 255;
						ax = a1 * (1 - sx) * sy;
						ak = ax * (1 - a0);
						fillLoc(dl, scolor, a0, ak);
						if (sx > 0) {
							a0 = (ddata[dl + 1] >> 24 & 0xFF) / 255;
							ax = a1 * sx * sy;
							ak = ax * (1 - a0);
							fillLoc(dl + 1, scolor, a0, ak);
						}
					}
				} else {
					const ak = a1 * (1 - a0);
					fillLoc(dl, scolor, a0, ak);
				}

			}
		}
	}

	drawPoint (p, width, data) {
		const { hardness, roundness, rotate } = p;
		let { color, size } = p;
		if (size === undefined) size = 1;

		let rad = width / 2;
		if (rad < 0.5) {
			rad = 0.5;
			width = 1;
		}
		const spot = this.getSpot(rad, hardness, roundness, rotate, Object.assign({}, color, { a: color.a }));
		const rdw = Math.floor(spot.width / 2);
		const rdh = Math.floor(spot.height / 2);
		this.drawTo(data, spot, { x: p.x - rdw, y: p.y - rdh });
	}

	drawPoints = (p, dx, dy, dw, count, data) => {
		const { hardness, roundness, rotate } = p;
		let { color, angle, size, width } = p;
		if (angle === undefined) angle = 0;
		if (size === undefined) size = 1;

		let rad = width / 2;
		const ncolor = Object.assign({}, color, { a: color.a });

		let spot = this.getSpot(rad, hardness, roundness, rotate, ncolor);
		let rdw = Math.floor(spot.width / 2);
		let rdh = Math.floor(spot.height / 2);
		for (var i = 0; i < count; i++) {
			this.drawTo(data, spot, { x: p.x - rdw, y: p.y - rdh }, rad < 10);
			p.x += dx;
			p.y += dy;
			p.width += dw;
		}
		return p;
	}

	drawLine (p1, p2, data, stepRatio) {
		let width = Math.round(p1.width * 100) / 100;
		const v = {
			x: p2.x - p1.x,
			y: p2.y - p1.y
		};
		const length = Math.sqrt(v.x * v.x + v.y * v.y);
		let step = width * stepRatio;
		if (length < step) return;
		if (step === 0) return;

		let rcount = length / step;
		let count = Math.floor(rcount);
		const p = Object.assign({}, p1);
		const dx = v.x / rcount;
		const dy = v.y / rcount;
		const dw = (p2.width - p1.width) / rcount;

		return this.drawPoints(p, dx, dy, dw, count, data);
	}
}
