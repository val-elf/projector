import { MapItem } from './map-item';
import { Map } from './map';
import utils from './2d-utils';

export class BoundaryCorner extends MapItem {
	dragHandler = event => this.trigger('drag', this);
	dragReleaser = event => {
		document.removeEventListener('mousemove', this.dragHandler);
		document.removeEventListener('touchmove', this.dragHandler);
		document.removeEventListener('mouseup', this.dragReleaser);
		document.removeEventListener('touchend', this.dragReleaser);
	}

	dragInitor() {
		document.addEventListener('mousemove', this.dragHandler);
		document.addEventListener('touchmove', this.dragHandler);
		document.addEventListener('mouseup', this.dragReleaser);
		document.addEventListener('touchend', this.dragReleaser);

		const cp = this.map.corners[this.pairs[2]];
		const p1 = this.point, p2 = cp.point;
		const box = this.map.bbox;
		this.box = {
			width: box.width,
			info: utils.getLineInfo(p1, p2)
		};
	}


	constructor(boundary, index){
		const boundaryColor = "#000000";
		const attrs = {stroke: boundaryColor, 'stroke-width': 1, fill: '#000000'};
		super(boundary, undefined, undefined, group => group.rect(10, 10).attr(attrs), boundary.group);
		this.index = index;
		this.pairs = BoundaryCorner.getPairs(this.index);
		this.item
			.on('mousedown', event => this.dragInitor(event))
			.on('touchstart', event => this.dragInitor(event));
	}

	get point() { return { x: this.x, y: this.y }; }
	get x() { return this.item.attr('x') + 5; }
	get y() { return this.item.attr('y') + 5; }

	static getPairs(index) {
		switch(index) {
			case 0: return [1, 2, 3];
			case 1: return [0, 3, 2];
			case 2: return [3, 0, 1];
			case 3: return [2, 1, 0];
		}
	}

	setOffsetDelta(delta, ctrlKey, shiftKey) {
		const deltaX = delta.x;
		const deltaY = delta.y;

		const xa = this.x + deltaX;
		const ya = this.y + deltaY;

		const { k, b } = this.box.info;
		const k1 = 1 / k;
		const b1 = ya + k1 * xa;
		let x = (b1 - b) / (k + k1);
		let y = k * x + b;
		const rdeltaX = x - this.x;
		const rdeltaY = y - this.y;
		this.setPosition({ x, y });		

		if (shiftKey) {
			const cp = this.map.corners[this.pairs[2]];
			const xp = cp.x - rdeltaX;
			const yp = cp.y - rdeltaY;
			cp.setPosition({ x: xp, y: yp });
		}
		this.map.applySize();
	}

	setPosition(point, applyOthers = true) {
		const x = point.x ? point.x - 5 : undefined;
		const y = point.y ? point.y - 5 : undefined;
		if (applyOthers) {
			const p1 = this.map.corners[this.pairs[0]];
			const p2 = this.map.corners[this.pairs[1]];
			if (x) p2.setPosition({ x: point.x }, false);
			if (y) p1.setPosition({ y: point.y }, false);	
		}
		this.item.attr({ x, y });
	}

}

export class Boundary extends Map {

	get items() { return this.map.selected; }
	corners = [];

	constructor(host, map) {
		super(host);
		this.map = map; // working map with selected items;
		this.item = this.group.rect().attr({ stroke: '#000000', 'fill': 'none' });
		this.corners = [0, 1, 2, 3].map(index => {
			const corner = this.createCorner(index);
			corner.on('drag', _ => this.tool.drag(corner));
			return corner;
		});
		this.group.hide();
		this.vrect.attr({stroke: '#00AA00'})
		this.map.viewport.on('changeView', _ => this.fresh());
	}

	createCorner(index) {
		return new BoundaryCorner(this, index);
	}

	get bbox() {
		if(!this.items.length) return null;
		let res = this.items.reduce((res, item) => {
			let bnd = item.boundingBox;
			if (bnd) {
				if(!res.l || res.l > bnd.x) res.l = bnd.x;
				if(!res.t || res.t > bnd.y) res.t = bnd.y;
				if(!res.r || res.r < bnd.x + bnd.width) res.r = bnd.x + bnd.width;
				if(!res.b || res.b < bnd.y + bnd.height) res.b = bnd.y + bnd.height;
			}
			return res;
		}, {l: null, t: null, r: null, b: null});
		res = {
			x: res.l,
			y: res.t,
			width: res.r - res.l,
			height : res.b - res.t
		};
		return res;
	}

	get pointBox() {
		const x = this.corners[0].x;
		const y = this.corners[0].y;
		const width = this.corners[3].x - x;
		const height = this.corners[3].y - y;
		return { x, y, width, height };
	}

	setBox() {
		this.item.attr(this.pointBox);
	}
	hidden = true;
	show() {
		this.hidden = false;
		this.fresh();
	}

	hide() {
		this.group.hide();
		this.hidden = true;
	}

	fresh() {
		if (this.hidden) return;
		const bbox = this.bbox;
		const viewport = this.viewport;
		if(!bbox){
			this.group.hide();
			return;
		} else this.group.show();
		const px = bbox.x;
		const py = bbox.y;
		this.corners.forEach(corner => corner.setPosition({
			x: bbox.x + (corner.index % 2) * bbox.width,
			y: bbox.y + (Math.floor(corner.index / 2) % 2 ) * bbox.height
		}));
		this.setBox();
	}

	applySize() {
		const oldBox = this.bbox;
		this.setBox();
		const newBox = this.pointBox;
		const zoom = utils.getDiagonal(newBox) / utils.getDiagonal(oldBox);
		this.items.forEach( item => {
			const ibox = item.boundingBox;
			const posX = (ibox.x - oldBox.x) * zoom + newBox.x;
			const posY = (ibox.y - oldBox.y) * zoom + newBox.y;
			item.setPosition({ x: posX, y: posY });
			item.setZoom(zoom);
		});
	}
}
