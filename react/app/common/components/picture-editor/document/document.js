import { mockLayers } from './layers-mock';
import { Layer } from './layer';
import { EventEmitter } from './event-emitter';

export class PictureDocument extends EventEmitter {
	_layers = [];
	get layers() { return this._layers; }
	get width() { return this._width; }
	get height() { return this._height; }
	get activeLayer() { return this._active; }

	constructor(width, height, layers = mockLayers) {
		super();
		this._width = width;
		this._height = height;
		this._layers = layers.map(layer => {
			const nlay = new Layer(layer, this);
			if (nlay.active) {
				if (this._active) {
					this._active.active = false;
				}
				this._active = nlay;
			}
			nlay.on('update', () => this.update());
			return nlay;
		});
		if (!this._layers.length) {
			const defaultLayer = new Layer({ id: 0 }, this);
			defaultLayer.fill('#FFFFFF');
			this._layers.push(defaultLayer);
		}
		if (!this._active) {
			this._layers[0].active = true;
		}
		this._view = document.createElement('canvas');
		Object.assign(this._view, { width, height });
		this._ctx = this._view.getContext('2d');
	}

	get preview() {
		if (!this._image) this._image = new Image();
		const view = this.getView();
		this._image.src = view.toDataURL('image/png');
		return this._image;
	}

	getView() {
		const { width, height, pan } = this.viewport.absBounding;
		this._ctx.clearRect(0, 0, this.width, this.height);

		this._layers
			.filter(layer => layer.isVisible)
			.forEach(layer => layer.placeView(this._ctx, {
				width,
				height,
				pan
			}));
		return { view: this._view, width, height };
	}

	set viewport(viewport) {
		this._viewport = viewport;
	}
	get viewport() { return this._viewport; }

	createNewLayer() {
		const layer = new Layer({}, this);
		this.addLayer(layer);
	}

	setActiveLayer(layer) {
		this._active = layer;
		this.layers.forEach(lr => lr.switchActiveTo(layer === lr));
		this.trigger('changeActiveLayer', layer);
	}

	update() {
		this.trigger('update');
	}

	addLayer(layer) {
		this._layers.push(layer);
	}

	resize({ width, height, square }) {
		const dx = width / this._width;
		const dy = height / this._height;
		let stretch = false;
		const shift = { dx: 0, dy: 0 };
		if (square !== undefined) {
			if ((square - 1) % 3 === 0) shift.dx = (width - this._width) / 2;
			if ((square - 2) % 3 === 0) shift.dx = width - this._width;
			if (Math.floor(square / 3) === 1) shift.dy = (height - this._height) / 2;
			if (Math.floor(square / 3) === 2) shift.dy = height - this.height;
		} else stretch = true;
		this._width = width;
		this._height = height;
		this.layers.forEach(lr => {
			const lw = lr.width * dx;
			const lh = lr.height * dy;
			lr.addOffset(shift);
			lr.resize(lw, lh, stretch);
		});
		Object.assign(this._view, { width, height });
		this.update();
	}
}