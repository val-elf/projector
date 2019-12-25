export class Canvas {
	data: number[] = [];
	width = 0;
	height = 0;

	constructor (width = 0, height = 0) {
		this.width = width;
		this.height = height;
		this.data = new Array(width * height * 4);
	}

	_getPoint(pos, data?) {
		if (!data) data = this.data;
		return [data[pos], data[pos + 1], data[pos + 2], data[pos + 3]];
	}

	_setPoint(pos: number, dt, data?) {
		if (!data) data = this.data;
		data[pos] = dt[0];
		data[pos + 1] = dt[1];
		data[pos + 2] = dt[2];
		data[pos + 3] = dt[3];
	}

	resize(nwidth, nheight) {
		const { width, height } = this;
		const ndata = new Array(nwidth * nheight * 4);
		ndata.fill(0);

		for (let i = 0; i < width * height; i ++) {
			const pos = i << 2;
			const x = i % width;
			const y = (i - x) / width;
			const npos = y * nwidth + x;
			const dt = this._getPoint(pos);
			this._setPoint(npos, dt, ndata);
		}

		this.data = ndata;
		this.width = nwidth;
		this.height = nheight;
	}

	draw(source, x, y) {
		const { width, height } = this;
		const { data: sdata, width: swidth, height: sheight } = source;

		for(let i = 0; i < swidth * sheight; i ++) {
			const pos = i << 2;
			let _x = i % swidth;
			const _y = (i - x) / swidth + y;
			_x += x;

			if (_x >= 0 && _y >= 0 && _x < width && _y < height) {
				const npos = _y * width + _x;
				const dt = this._getPoint(pos, sdata);
				this._setPoint(npos, dt);
			}
		}
	}

	fill(color) {
		const filled = new Array(this.width * this.height);
		filled.fill(color);
		this.data = (filled as any).flat();
	}

	clear() {
		this.data.fill(0);
	}

	putImageData(source, x, y) {

	}

	drawImage(image, x, y) {

	}

	toImageData() {
		const result = new ImageData(this.width, this.height);
		result.data.set(this.data);
		return result;
	}
}