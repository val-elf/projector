import { EventEmitter } from './event-emitter';
import { getBoundary } from '../utils';

const overlayMapping = {
	'source-over': 'normal',
	'lighter': 'lighter color',
	'multiply': 'multiply',
	'screen': 'screen',
	'overlay': 'overlay',
	'darken': 'darken',
	'lighten': 'lighten',
	'color-dodge': 'color dodge',
	'color-burn': 'color burn',
	'hard-light': 'hard light',
	'soft-light': 'soft light',
	'difference': 'difference',
	'exclusion': 'exclusion',
	'hue': 'hue',
	'saturation': 'saturation',
	'color': 'color',
	'luminosity': 'luminosity'
}

export class Layer extends EventEmitter {
	canvas = document.createElement('canvas');
	mergedCanvas = document.createElement('canvas');
	ctx = this.canvas.getContext('2d');
	mergedCtx = this.mergedCanvas.getContext('2d');

	constructor(data, doc){
		super();
		const { composite, opacity, offsetX, offsetY, active, width, height, isVisible, name, working, id } = data;
		this._width = width !== undefined ? width : doc.width;
		this._height = height !== undefined ? height : doc.height;

		this.id = id;
		this._name = name;
		this.state = {
			document: doc,
			working,
			data,
			active: active !== undefined ? active: false,
			composite: composite !== undefined ? composite : 'source-over',
			opacity: opacity !== undefined ? opacity : 1,
			offsetX: offsetX !== undefined ? offsetX : 0,
			offsetY: offsetY !== undefined ? offsetY : 0,
			isVisible: isVisible !== undefined ? isVisible : true
		};
		Object.assign(this.canvas, { width: this._width, height: this._height });
		Object.assign(this.mergedCanvas, { width: doc.width, height: doc.height });
		this.init();
	}

	get document() { return this.state.document; }

	get composite() {
		let { composite } = this.state;
		if (!composite) composite = 'source-over';
		return composite;
	}
	set composite(value) { this.state.composite = value; }

	get overlay() {
		let comp = this.composite;
		if (!comp) comp = 'source-over';
		return overlayMapping[comp];
	}
	set overlay(value) {
		const key = Object.keys(overlayMapping).find(key => overlayMapping[key] === value) || 'source-over';
		this.composite = key;
	}
	get context() { return this.ctx; }

	get opacity() {
		let { opacity } = this.state;
		if (opacity === undefined) opacity = 1;
		return opacity;
	}
	set opacity(opacity) { this.state.opacity = opacity; }

	get active() { return this.state.active; }
	set active(value) {
		this.state.active = value;
		if (value) this.document.setActiveLayer(this);
		else this._working = null;
	}

	get offsetX() { return this.state.offsetX; }
	set offsetX(value) { this.state.offsetX = value; }
	get offsetY() { return this.state.offsetY; }
	set offsetY(value) { this.state.offsetY = value; }

	setOffset(x, y) {
		this.offsetX = x;
		this.offsetY = y;
	}


	get width() { return this._width; }
	get height() { return this._height; }
	get name() { return this._name; }

	get isVisible() { return this.state.isVisible; }
	set isVisible(value) { this.state.isVisible = value; }

	get workingLayer() {
		const { width, height, zoom, pan } = this.document.viewport;
		const { width: dwidth, height: dheight } = this.document;
		let nwidth = width / zoom;
		let nheight = height / zoom;

		if (nwidth > dwidth) nwidth = dwidth;
		if (nheight > dheight) nheight = dheight;

		if (!this._working) this._working = new Layer({ width: nwidth, height: nheight }, this.document);
		else this._working._resize(nwidth, nheight);

		this._working.offsetX = pan.x < 0 ? -pan.x / zoom : 0;
		this._working.offsetY = pan.y < 0 ? -pan.y / zoom : 0;
		return this._working;
	}

	releaseWorkingLayer() {
		this._working = null;
	}

	fill(color) {
		this.ctx.fillStyle = color;
		this.ctx.fillRect(0, 0, this.width, this.height);
	}

	_resize(width, height) {
		if (width !== this._width || height !== this._height) {
			this._width = width;
			this._height = height;
			Object.assign(this.canvas, { width, height });
		}
	}

	resize(width, height, stretch = false) {
		const cnv = document.createElement('canvas');
		const { document: doc } = this;
		const { width: owidth, height: oheight } = this.canvas;
		Object.assign(cnv, { width: owidth, height: oheight });
		const ctx = cnv.getContext('2d');
		ctx.drawImage(this.canvas, 0, 0);
		this._width = width;
		this._height = height;
		Object.assign(this.canvas, { width, height });
		Object.assign(this.mergedCanvas, { width: doc.width, height: doc.height });
		if (!stretch) this.ctx.drawImage(cnv, 0, 0);
		else this.ctx.drawImage(cnv, 0, 0, cnv.width, cnv.height, 0, 0, width, height);
	}

	addOffset({ dx, dy }) {
		this.offsetX += dx;
		this.offsetY += dy;
	}

	init() {
		const { data } = this.state;
		const { width, height } = this;
		this.canvas.width = width;
		this.canvas.height = height;
		if (data) {
			const { source, img } = data;
			if (source) this.ctx.putImageData(source, 0, 0);
			if (img) {
				const image = new Image();
				image.src = img;
				image.addEventListener('load', () => {
					this.ctx.clearRect(0, 0, this._width, this.height);
					this.ctx.drawImage(image, 0, 0);
					this.trigger('update');
				});
			}
		}
	}

	placeView(target, viewBound) {
		target.save();
		target.globalAlpha = this.opacity;
		target.globalCompositeOperation = this.composite;
		const { width, height, pan } = viewBound;
		const merged = this.getMerged(pan.x, pan.y, width, height);
		target.drawImage(merged, 0, 0);
		target.restore();
	}

	getMerged(offsetX = 0, offsetY = 0, width = this.document.width, height = this.document.height) {
		let roffsetX = this.offsetX;
		let roffsetY = this.offsetY;
		// if (offsetX < 0) roffsetX += offsetX;
		// if (offsetY < 0) roffsetY += offsetY;
		if (this.mergedCanvas.width !== width || this.mergedCanvas.height !== height) {
			Object.assign(this.mergedCanvas, {
				width, height
			});
		} else this.mergedCtx.clearRect(0, 0, width, height);

		this.mergedCtx.drawImage(this.canvas, offsetX < 0 ? -offsetX : 0, offsetY < 0 ? -offsetY : 0, width, height,
			roffsetX, roffsetY, width, height
		);
		if (this._working) {
			this.mergedCtx.save();
			this.mergedCtx.globalAlpha = this._working.opacity;
			this.mergedCtx.globalCompositeOperation = this._working.composite;
			this.mergedCtx.drawImage(this._working.canvas, 0, 0);
			this.mergedCtx.restore();
		}
		return this.mergedCanvas;
	}

	get merged() {
		return getMerged();
	}

	resizeTo(width, height, dx, dy) {
		this.offsetX -= dx;
		this.offsetY -= dy;
		const wcanvas = document.createElement('canvas');
		Object.assign(wcanvas, { width: this.width, height: this.height });
		const wctx = wcanvas.getContext('2d');
		wctx.drawImage(this.canvas, 0, 0);
		Object.assign(this.canvas, { width, height });
		this._width = width;
		this._height = height;
		this.ctx.drawImage(wcanvas, dx, dy);
	}

	applyWorking() {
		if (this._working) {
			this.ctx.save();
			/*
			const { left, top, width, height } = getBoundary(this._working.ctx);
			let { ldx, ldy, rdx, rdy } = {
				ldx: left - this.offsetX,
				ldy: top - this.offsetY,
				rdx: this.offsetX + this.width - (left + width),
				rdy: this.offsetY + this.height - (top + height)
			}
			if (ldx < 0 || ldy < 0 || rdx < 0 || rdy < 0) { // recalculate layer dimensions
				ldx = ldx < 0 ? ldx : 0;
				ldy = ldy < 0 ? ldy : 0;
				rdx = rdx < 0 ? rdx : 0;
				rdy = rdy < 0 ? rdy : 0;
				const nwidth = this.width - ldx - rdx;
				const nheight = this.height - ldy - rdy;
				this.resizeTo(nwidth, nheight, -ldx, -ldy);
			}
			*/
			this.ctx.globalAlpha = this._working.opacity;
			this.ctx.globalCompositeOperation = this._working.composite;
			this.ctx.drawImage(this._working.canvas, -this.offsetX + this._working.offsetX, -this.offsetY + this._working.offsetY);
			this._working.clean();
			this.ctx.restore();
			this.trigger('apply');
		}
	}

	mergeWith(layer) {
		const { composite, canvas: source } = layer;
		if (source.width > this.width || source.height > this.height) {
			const { width, height } = source;
			const ncnv = document.createElement('canvas');
			Object.assign(ncnv, { width, height });
			const nctx = ncnv.getContext('2d');
			nctx.drawImage(this.canvas, 0, 0);
			this.canvas.width = width;
			this.canvas.height = height;
			this._width = width;
			this._height = height;
			this.ctx.drawImage(ncnv, 0, 0);
		}
		this.ctx.save();
		this.ctx.globalAlpha = opacity;
		this.ctx.globalCompositeOperation = composite;
		this.ctx.drawImage(source, 0, 0);
		this.ctx.restore();
	}

	switchActiveTo(activeState) {
		this.state.active = activeState;
	}

	getContentBoundary() {
		return getBoundary(this.ctx);
	}

	clean() {
		this.ctx.clearRect(0, 0, this.width, this.height);
	}
}