import SVG from 'svg.js';
import { Eventful } from 'projector/common/eventful';
import { Viewport } from './viewport';
import { Shape } from './shape';
import { Image } from './image';

SVG.extend(SVG.Element, {
	isHidden: function(){
		return this.node.style.display === 'none';
	}
});

export class MapHost {

	_maps = {};

	get viewport() { return this._viewport; }
	get maps() { return this._maps; }
	get paper() { return this._paper; }
	get editor() { return this._editor; }

	constructor(paper, viewport = new Viewport(1, { x: 0, y: 0 }), editor) {
		this._paper = paper;
		this._viewport = viewport;
		this._editor = editor;
		this.line = this._paper.rect(100, 100).attr({stroke: '#AA0000', fill: 'none', 'stroke-width': 1});
		this.line.hide();
		this.viewport.on('changeView', _ => this.fresh());
		this.fresh();
	}

	addMap(map, name) {
		this._maps[name] = map;
	}

	getMap(name) {
		return this._maps[name];
	}

	fresh() {
		const offset = this.viewport.getOffset();
		const zm = this.viewport.getZoom();
		this.line.attr({x: offset.x, y: offset.y, width: 100 * zm, height: 100 * zm});
	}

	setOffsetDelta(delta, onlyBase, axisMove) {
		let vp = this.viewport;
		if (onlyBase) vp = this.getMap('base').viewport;
		vp.setOffsetDelta(delta, true);
	}

	moveZoom(zoom, point, onlyBase) {
		let vp = this.viewport;
		if (onlyBase) vp = this.getMap('base').viewport;
		vp.applyZoomMultiplyer(zoom, point);
	}
}

export class Map extends Eventful {
	viewport = new Viewport(1, { x: 0, y: 0 });

	get host() { return this._host; }
	get paper() { return this._host.paper; }
	get editor() { return this._host.editor; }
	get tool() { return this.editor.tool; }

	constructor(host) {
		super();
		this._host = host;
		this.group = this.paper.group();
		this.vrect = this.paper.rect(100, 100).attr({stroke: '#AA0000', 'stroke-width': 1, fill: 'none'});
		this.vrect.hide();
		this.freshViewport();
		this.viewport.on('changeView', () => this.changeView());		
	}

	freshViewport() {
		const offset = this.viewport.getOffset();
		const zoom = this.viewport.getZoom();
		this.vrect.attr({x: this.offset.x, y: this.offset.y, width: 100 * zoom, height: 100 * zoom });
	}

	get width() {
		const clientRect = this.paper.node.getBoundingClientRect();
		return clientRect.width;
	}

	get height() {
		const clientRect = this.paper.node.getBoundingClientRect();
		return clientRect.height;
	}

	get offset() {
		return this.viewport.getOffset();
	}

	get zoom() {
		return this.viewport.getZoom();
	}

	get matrix() {
		const { offset: { x, y }, zoom } = this;
		return `matrix(${zoom}, 0, 0, ${zoom}, ${Math.round(x)}, ${Math.round(y)})`;
	}

	changeView() {
		this.group.attr('transform', this.matrix);
		this.freshViewport();
	}

}

export class LocationMap extends Map {
	items = [];
	selected = [];

	constructor(location, host) {
		super(host);
		this.vrect.attr({stroke: '#0000AA'});
		this.viewport.setParent(host.viewport);
		if (location) {
			this.initLocation(location);
		}
		this.changeView();
	}

	get lockSelection() {
		return this._lockSelection;
	}

	set lockSelection(value) {
		this._lockSelection = value;
	}

	clear() {
		this.selected = [];
		this.items = [];
		this.group.clear();
	}

	deleteSelected() {
		if (!this.selected.length) return;
		this.selected.forEach(selected => {
			const index = this.items.indexOf(selected);
			if (index > -1) {
				selected.delete();
				this.items.splice(index, 1);
			}
		});
		this.selected = [];
		this.editor.boundary.fresh();
	}

	initLocation(location) {
		const { map } = location;
		map && map.forEach(item => {
			let itemType;
			if (item.shape) itemType = Shape;
			if (item.image) itemType = Image;

			const entity = this.generateItem(item, itemType);
			if (entity) {
				this.items.push(entity);
				this.group.add(entity.group);
			}
		});

		this.viewport.setLocalViewPoint(1, { x: 0, y: 0 }, 1 / location.baseZoom);
		if (location.parent) {
			let { scale, position } = location.parent;
			this.viewport.setLocalViewPoint(scale, position.plain(), 1 / location.baseZoom);
		}

		this.viewport.apply();
	}

	generateItem(data, itemType) {
		const item = new itemType(this, data);
		item.on('click', _ => this.tool.click(item));
		item.on('drag', _ => this.tool.drag(item));
		return item;
	}

	createItem(item, itemType) {
		const entity = this.generateItem(item, itemType);
		this.group.add(entity.group);
		this.items.push(entity);
		return entity;
	}

	createShape(item) {
		return this.createItem(item, Shape);
	}

	createImage(item) {
		return this.createItem(item, Image);
	}

	viewToSelected() {
		const boundary = this.host.getMap('boundary');
		const { bbox } = boundary;
		const { viewport } = this.host;
		if (bbox) {
			const view = this.editor.boundingRect;
			const hzoom = view.height / bbox.height;
			const vzoom = view.width / bbox.width;
			const dzoom =  (hzoom > vzoom ? vzoom : hzoom) * 0.9;
			const zoom = viewport.getZoom();
			const offset = viewport.getOffset();
			const dx = -bbox.x + (view.width - bbox.width) / 2;
			const dy = -bbox.y + (view.height - bbox.height) / 2;
			offset.x += dx;
			offset.y += dy;
			viewport.setViewPoint(zoom, offset);
			viewport.applyZoomMultiplyer(dzoom, { x: view.width / 2, y: view.height / 2 });
		}
	}

	createNewImage(imageData, file) {
		const voffset = this.viewport.getOffset();
		const zoom = 1 / this.viewport.getZoom();
		const offset = {
			x: -voffset.x * zoom,
			y: -voffset.y * zoom
		}
		const data = {
			image: file._id,
			width: imageData.preview.width,
			height: imageData.preview.height,
			offset,
			zoom
		}
		const image = this.createImage(data);
		this.selectItem(image);
	}

	selectItem(item, value = true, multiple = false) {
		let same = this.selected.some(selected => selected === item);
		if (multiple) {
			if (same) {
				const index = this.selected.indexOf(item);
				this.selected.splice(index, 1);
				item.select(false);
			} else if (value) {
				this.selected.push(item);
				item.select(value);
			}
		} else {
			if (same && this.selected.length > 1) same = false;
			this.selected.forEach(selected => selected.select(false));
			this.selected = [];
			if (!same && value) {
				this.selected.push(item);
				item.select(value);
			}
		}
		this.editor.boundary.fresh();
	}

	stepUp(item) {
		const index = this.items.indexOf(item);
		if (index > -1) {
			this.items.splice(index, 1);
			this.items.splice(index + 1, 0, item);
		}
	}

	stepDown(item) {
		const index = this.items.indexOf(item);
		if (index > 0) {
			this.items.splice(index, 1);
			this.items.splice(index - 1, 0, item);
		}
	}

	clearSelected() {
		this.selected.forEach(item => item.select(false));
		this.selected = [];
		this.editor.boundary.fresh();
	}

	toJson() {
		return this.items.map(item => item.toJson());
	}

	changeView() {
		super.changeView();
		this.items.map(item => item.fresh());
	}
}

export class ParentMap extends LocationMap {
	constructor(location, host) {
		super(location, host);
		this.vrect.attr({stroke: '#AA00BB'});
	}

	generateItem(data, itemType) {
		return new itemType(this, data);
	}
}