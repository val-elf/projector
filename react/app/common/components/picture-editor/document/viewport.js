import { EventEmitter } from './event-emitter';

export class Viewport extends EventEmitter {

	constructor(doc, window) {
		super();
		this.canvas.className = 'image-page_viewport-canvas';
		this.document = doc;
		this.window = window;
		doc.viewport = this;
	}

	_width = 0; // width of view window
	_height = 0; // height of view window
	_zoom = 1;
	_pan = { x: 0, y: 0 };

	canvas = document.createElement('canvas');
	ctx = this.canvas.getContext('2d');

	resize(width, height) {
		this._width = width;
		this._height = height;
		this._recalculateDimensions();
	}

	get bounding() {
		return this.canvas.getBoundingClientRect();
	}

	get width() { // width of view rectangle (in pixels)
		const { width: dwidth } = this.viewDocumentDimensions;
		const { pan } = this;
		let rwidth = dwidth;
		const lpoint = pan.x + dwidth;
		if (lpoint > this._width) rwidth -= lpoint - this._width;
		if (pan.x < 0) rwidth += pan.x;
		return rwidth;
	}
	get height() {
		const { height: dheight } = this.viewDocumentDimensions;
		const { pan } = this;
		let rheight = dheight;
		const tpoint = pan.y + dheight;
		if (tpoint > this._height) rheight -= tpoint - this._height;
		if (pan.y < 0) rheight += pan.y;
		return rheight;
	}

	getLayerLocation(pos) {
		const { x, y } = pos;
		const { left, top } = this.window.getBoundingClientRect();
		let rx = (x - left) - this.pan.x;
		let ry = (y - top) - this.pan.y;
		return { x: rx / this._zoom, y: ry / this._zoom };
	}

	get zoom() { return this._zoom; }
	set zoom(value) {
		this._zoom = value;
		this._recalculateDimensions();
		this.trigger('change');
	}
	get pan() { return this._pan; }
	set pan(value) {
		Object.assign(this._pan, value);
		this._recalculateDimensions();
		this.trigger('change');
	}

	get absPan() {
		const { x, y } = this._pan;
		return { x: x / this._zoom, y: y / this._zoom };
	}
	get absWidth() { return this._width / this._zoom };
	get absHeight() { return this._height / this._zoom };
	get viewDocumentDimensions() {
		const { width, height } = this.document;
		return {
			width: width * this._zoom,
			height: height * this._zoom
		};
	}

	get absBounding() {
		const { width, height } = this;
		const awidth = width / this._zoom;
		const aheight = height / this._zoom;
		return {
			width: awidth,
			height: aheight,
			pan: {
				x: this.pan.x / this._zoom,
				y: this.pan.y / this._zoom
			}
		}
	}

	_recalculateDimensions() {
		const { pan, width, height } = this;
		const { width: dwidth, height: dheight } = this.viewDocumentDimensions;
		const isFlyout = pan.x > this._width || pan.y > this._height ||
			-pan.x > dwidth || -pan.y > dheight;

		if (isFlyout) {
			Object.assign(this.canvas, { width: 0, height: 0 });
			Object.assign(this.canvas.style, { left: 0, top: 0 });
			return;
		}

		const xshift = Math.round(pan.x > 0 ? pan.x : 0);
		const yshift = Math.round(pan.y > 0 ? pan.y : 0);

		Object.assign(this.canvas.style, {
			left: `${ xshift }px`,
			top: `${ yshift }px`,
			backgroundPositionX: `-${ xshift }px`,
			backgroundPositionY: `-${ yshift }px`
		});
		if (this.canvas.width !== width || this.canvas.height !== height) {
			Object.assign(this.canvas, { width, height });
			//this.putImage(this.document._view);
			this.redraw();
		}
	}

	redraw() {
		const { view } = this.document.getView();
		this.putImage(view);
	}

	putImage(image) {
		const { width, height, _zoom: zoom } = this;
		if (width == 0 || height == 0) return;
		this.ctx.clearRect(0, 0, width, height);
		this.ctx.imageSmoothingEnabled = zoom <= 1;
		this.ctx.drawImage(image,
			0, 0, width / zoom, height / zoom, // source coords / dims
			0, 0, width, height // viewport coords / dims
		);
	}
}