import { getBoundary } from '../utils';
import { OverlayMappingEnum } from './models';
import { PictureDocument } from './document';
import { storage } from '../store/store';
import { LayerStorage, ILayerStore } from '../store/layer.store';

export class Layer {
	readonly canvas = document.createElement('canvas');
	private mergedCanvas = document.createElement('canvas');
	private ctx = this.canvas.getContext('2d');
	private mergedCtx = this.mergedCanvas.getContext('2d');
	private document: PictureDocument;
	private working: Layer;

interface ILayerState {
	document: PictureDocument;
	working: boolean;
	data: ILayerData;
	active: boolean;
	composite: GlobalCompositeOperation;
	opacity: number;
	offsetX: number;
	offsetY: number;
	isVisible: boolean;
}

	static generateId() {
		return (Math.random() * 100000).toFixed(0);
	}


	id = Layer.generateId();

	get merged() {
		return this.getMerged();
	}

	get composite() {
		let comp = this.state.composite;
		if (!comp) comp = OverlayMappingEnum.sourceOver;
		return comp;
	}
	set composite(value: OverlayMappingEnum) {
		this.layerStorage.setComposite(value);
	}
	set overlay(value) {
		const key = (Object.keys(overlayMapping)
			.find(key => overlayMapping[key] === value) || 'source-over') as GlobalCompositeOperation;
		this.composite = key;
	}
	get context() { return this.ctx; }
	get state() { return this.layerStorage.state; }

	get opacity() {
		let { opacity } = this.state;
		return opacity !== undefined ? opacity : 1;
	}
	set opacity(opacity: number) { this.layerStorage.setOpacity(opacity); }

	get active() { return this.state.active; }
	set active(value: boolean) {
		this.layerStorage.setActive(value);
		if (!value) this.working = null;
	}

	get offsetX() { return this.state.offset.x; }
	get offsetY() { return this.state.offset.y; }

	get width() { return this.state.width; }
	get height() { return this.state.height; }
	get name() { return this.state.name; }

	get isVisible() { return this.state.isVisible; }
	set isVisible(value: boolean) { this.layerStorage.setVisible(value); }

	get workingLayer() {
		const { viewportWidth, viewportHeight, pan, zoom } = storage.state;

		if (!this.working) this.initWorkingLayer();

		this.working._resize(viewportWidth / zoom, viewportHeight / zoom);

		this.layerStorage.setOffset({
			x: pan.x < 0 ? -pan.x / zoom : 0,
			y: pan.y < 0 ? -pan.y / zoom : 0
		})
		return this.working;
	}

	constructor(data: ILayerStore, doc: PictureDocument) {
		const { composite, opacity, offset, active, width, height, isVisible, name, id } = data;
		const params = { ...data, ... {
			composite: composite || OverlayMappingEnum.sourceOver,
			opacity: opacity !== undefined ? opacity : 1,
			offsetX: offset && offset.x !== undefined ? offset.x : 0,
			offsetY: offset && offset.y !== undefined ? offset.y : 0,
			width: width !== undefined ? width: doc.width,
			height: height !== undefined ? height: doc.height
		} };

		this.document = doc;
		this.layerStorage = storage.addLayer(params);
		Object.assign(this.mergedCanvas, { width: doc.width, height: doc.height });

		this.init();
	}

	init() {
		const { width, height } = this;
		this.layerStorage.subscribe('setDimensions', (width: number, height: number) => {
			Object.assign(this.canvas, { width, height });
		});

		this.layerStorage.subscribe('putImageData', (imageData: ImageData) => {
			this.ctx.putImageData(imageData, 0, 0);
		});

		const { source, img } = this.state;
		if (source) this.ctx.putImageData(source, 0, 0);
		if (img) {
			const image = new Image();
			image.src = img;
			image.addEventListener('load', () => {
				this.ctx.clearRect(0, 0, width, height);
				this.ctx.drawImage(image, 0, 0);
				this.layerStorage.update();
			});
		}
	}

	private initWorkingLayer() {
		this.working = new Layer({
			name: 'working',
			id: Layer.generateId()
		}, this.document);
	}

	setOffset(x: number, y: number) {
		this.layerStorage.setOffset({ x, y });
	}

	releaseWorkingLayer() {
		this.working = null;
	}

	fill(color: string) {
		this.ctx.fillStyle = color;
		this.ctx.fillRect(0, 0, this.width, this.height);
	}

	private _resize(width: number, height: number) {
		if (width !== this.width || height !== this.height) this.layerStorage.setDimensions(width, height);
	}

	resize(width: number, height: number, stretch = false) {
		const cnv = document.createElement('canvas');
		const { document: doc } = this;
		const { width: owidth, height: oheight } = this.canvas;

		Object.assign(cnv, { width: owidth, height: oheight });

		const ctx = cnv.getContext('2d');
		ctx.drawImage(this.canvas, 0, 0);

		this._resize(width, height);
		Object.assign(this.mergedCanvas, { width: doc.width, height: doc.height });

		if (!stretch) this.ctx.drawImage(cnv, 0, 0);
		else this.ctx.drawImage(cnv, 0, 0, cnv.width, cnv.height, 0, 0, width, height);
	}

	addOffset({ dx, dy }: { dx: number, dy: number }) {
		const { x, y } = this.layerStorage.state.offset;
		this.layerStorage.setOffset({ x: x + dx, y: y + dy });
	}

	placeView(target: CanvasRenderingContext2D, viewBound: { x: number, y: number, width: number, height: number }) {
		target.save();
		target.globalAlpha = this.opacity;
		target.globalCompositeOperation = this.composite;
		const { width, height, x, y } = viewBound;
		const merged = this.getMerged(x, y, width, height);
		target.drawImage(merged, 0, 0);
		target.restore();
	}

	getMerged(offsetX = 0, offsetY = 0, width = this.document.width, height = this.document.height) {
		let roffsetX = this.offsetX;
		let roffsetY = this.offsetY;

		if (this.mergedCanvas.width !== width || this.mergedCanvas.height !== height) {
			Object.assign(this.mergedCanvas, {
				width, height
			});
		} else this.mergedCtx.clearRect(0, 0, width, height);

		this.mergedCtx.drawImage(this.canvas, offsetX < 0 ? -offsetX : 0, offsetY < 0 ? -offsetY : 0, width, height,
			roffsetX, roffsetY, width, height
		);
		if (this.working) {
			this.mergedCtx.save();
			this.mergedCtx.globalAlpha = this._working.opacity;
			this.mergedCtx.globalCompositeOperation = this._working.composite as GlobalCompositeOperation;
			this.mergedCtx.drawImage(this._working.canvas, 0, 0);
			this.mergedCtx.restore();
		}
		return this.mergedCanvas;
	}

	resizeTo(width: number, height: number, dx: number, dy: number) {
		this.setOffset(-dx, -dy);
		const wcanvas = document.createElement('canvas');
		Object.assign(wcanvas, { width: this.width, height: this.height });
		const wctx = wcanvas.getContext('2d');
		wctx.drawImage(this.canvas, 0, 0);
		this.layerStorage.setDimensions(width, height);
	}

	applyWorking() {
		if (this.working) {
			this.ctx.save();
			this.ctx.globalAlpha = this.working.opacity;
			this.ctx.globalCompositeOperation = this.working.composite;
			this.ctx.drawImage(this.working.canvas, -this.offsetX + this.working.offsetX, -this.offsetY + this.working.offsetY);
			this.working.clean();
			this.ctx.restore();
			this.layerStorage.apply();
		}
	}

	mergeWith(layer: Layer) {
		const { composite, canvas: source } = layer;
		if (source.width > this.width || source.height > this.height) {
			const { width, height } = source;
			const ncnv = document.createElement('canvas');
			Object.assign(ncnv, { width, height });
			const nctx = ncnv.getContext('2d');
			nctx.drawImage(this.canvas, 0, 0);
			this.layerStorage.setDimensions(width, height);
			this.ctx.drawImage(ncnv, 0, 0);
		}
		this.ctx.save();
		this.ctx.globalAlpha = this.opacity;
		this.ctx.globalCompositeOperation = composite;
		this.ctx.drawImage(source, 0, 0);
		this.ctx.restore();
	}

	switchActiveTo(activeState: boolean) {
		this.layerStorage.setActive(activeState);
	}

	getContentBoundary() {
		return getBoundary(this.ctx);
	}

	clean() {
		this.ctx.clearRect(0, 0, this.width, this.height);
	}
}