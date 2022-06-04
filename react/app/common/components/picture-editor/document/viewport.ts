import { PictureDocument } from './document';
import { ICoordinates } from '../models/editor.model';
import { storage } from '../store/store';
import { IDocumentView } from 'controls/picture-editor/document/models';

export class Viewport {
	document: PictureDocument;
	window: HTMLElement;
	view: IDocumentView;

	constructor(doc: PictureDocument, window: HTMLElement) {
		this.canvas.className = 'image-page_viewport-canvas';
		this.document = doc;
		this.window = window;
		doc.viewport = this;

		storage.subscribe('setZoom', () => {
			this._recalculateDimensions();
			this._rerender();
			this._putView();
		});

		storage.subscribe('setPan', () => {
			this._recalculateDimensions();
			this._putView();
		});

		storage.subscribe('setViewpoint', (state) => {
			this._recalculateDimensions();
			this._rerender();
			this._putView();
		});
	}

	_width = 0; // width of view window
	_height = 0; // height of view window

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
		return Math.round(rwidth);
	}
	get height() {
		const { height: dheight } = this.viewDocumentDimensions;
		const { pan } = this;
		let rheight = dheight;
		const tpoint = pan.y + dheight;
		if (tpoint > this._height) rheight -= tpoint - this._height;
		if (pan.y < 0) rheight += pan.y;
		return Math.round(rheight);
	}

	get zoom() { return storage.state.zoom; }
	get pan() { return storage.state.pan; }

	get absPan() {
		const { x, y } = this.pan;
		return { x: x / this.zoom, y: y / this.zoom };
	}
	get absWidth() { return this._width / this.zoom };
	get absHeight() { return this._height / this.zoom };
	get viewDocumentDimensions() {
		const { width, height } = this.document;
		return {
			width: width * this.zoom,
			height: height * this.zoom
		};
	}

	get absBounding() {
		const { width, height } = this;
		const awidth = width / this.zoom;
		const aheight = height / this.zoom;
		return {
			width: awidth,
			height: aheight,
			pan: {
				x: this.pan.x / this.zoom,
				y: this.pan.y / this.zoom
			}
		}
	}

	private get isFlyout() {
		const { width: dwidth, height: dheight } = this.viewDocumentDimensions;
		const { pan: { x, y }} = this;
		return x > this._width || y > this._height || -x > dwidth || -y > dheight;
	}

	private _recalculateDimensions() { // set canvas width, height and position on the window
		const { pan: { x, y }, zoom } = this;
		const { width, height } = this.viewDocumentDimensions;

		if (this.isFlyout) {
			Object.assign(this.canvas, { width: 0, height: 0 });
			Object.assign(this.canvas.style, { left: 0, top: 0 });
			return;
		}

		const xshift = Math.round(x > 0 ? x : 0);
		const yshift = Math.round(y > 0 ? y : 0);

		Object.assign(this.canvas.style, {
			left: `${ xshift }px`,
			top: `${ yshift }px`,
			backgroundPositionX: `-${ xshift }px`,
			backgroundPositionY: `-${ yshift }px`
		});

		if (this.canvas.width !== width || this.canvas.height !== height) Object.assign(this.canvas, { width, height });
		storage.setViewportDimensions(width, height);

		this.canvas.setAttribute('v-x', x.toFixed(2));
		this.canvas.setAttribute('v-y', y.toFixed(2));
		this.canvas.setAttribute('v-z', zoom.toFixed(5));
	}

	getLayerLocation(pos) {
		const { x, y } = pos;
		const { pan, zoom } = this;
		const { left, top } = this.window.getBoundingClientRect();
		let rx = (x - left) - pan.x;
		let ry = (y - top) - pan.y;
		return { x: rx / zoom, y: ry / zoom };
	}

	private _rerender() { // should be called when we change the zoom of picture only
		const { x, y } = this.pan;
		const dx = x < 0 ? -x : 0;
		const dy = y < 0 ? -y : 0;
		this.view = this.document.getView({ x: dx, y: dy, width: this.width, height: this.height });
	}

	private _putView() {
		if (!this.view) this._rerender();
		const { view, width, height, zoom, pan: { x, y } } = this;
		if (width == 0 || height == 0) return;
		this.ctx.clearRect(0, 0, width, height);
		this.ctx.imageSmoothingEnabled = zoom <= 1;
		this.ctx.drawImage(view.view,
			0, 0, width / zoom, height / zoom, // source coords / dims
			x < 0 ? x : 0, y < 0 ? y : 0, width, height // viewport coords / dims
		);
	}

	redraw() {
		this._recalculateDimensions();
		this._rerender();
		this._putView();
	}
}