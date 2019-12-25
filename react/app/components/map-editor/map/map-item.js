import { Eventful } from '~/common/eventful';

export class MapItem extends Eventful{
	dragHandler = event => {
		if (this.locked) return;
		if (this.selected) this.trigger('drag', this);
	}

	constructor(map, offset = { x: 0, y: 0 }, zoom = 1, itemGenerator, parentGroup) {
		super();
		this.map = map;
		this.mapGroup = map.group;
		this._group = parentGroup || this.map.paper.group();
		this.zoom = zoom;
		this.offset = offset;
		this.selected = false;

		if (itemGenerator) {
			this.item = itemGenerator(this._group);

			this._group.add(this.item);

			const clicker = event => {
				this.trigger('click', this);
			}
			this.item.on('click', clicker);
			this.item.on('touchend', clicker);

			this.item.on('mousedown', event => document.addEventListener('mousemove', this.dragHandler));
			this.item.on('mouseup', event => document.removeEventListener('mousemove', this.dragHandler));
			this.item.on('touchstart', event => document.addEventListener('touchmove', this.dragHandler));
			this.item.on('touchend', event => document.removeEventListener('touchmove', this.dragHandler));
		}
	}

	get viewport() { return this.map.viewport; }

	get matrix() {
		return `matrix(${this.zoom}, 0, 0, ${this.zoom}, ${this.offset.x}, ${this.offset.y})`;
	}

	get group() {
		return this._group;
	}

	get name() {
		return 'Undefined';
	}

	toJson() {
		return {};
	}

	lock() {
		this.locked = true;
		this.fresh();
	}

	setZoom(zoomFactor) {
		this.zoom *= zoomFactor;
		this.fresh();
	}

	setOffsetDelta(delta) {
		const rz = this.viewport.getZoom();
		const realDelta = {
			x: delta.x / rz,
			y: delta.y / rz
		};
		Object.assign(this.offset, {
			x: this.offset.x + realDelta.x,
			y: this.offset.y + realDelta.y
		});
		this.fresh();
	}

	get boundingBox() {
		const rz = this.viewport.getZoom();
		const oz = this.zoom;
		const bbox = this.item.bbox();
		bbox.width *= oz * rz;
		bbox.height *= oz * rz;
		bbox.x = bbox.x * oz + this.offset.x;
		bbox.y = bbox.y * oz + this.offset.y;
		const viewCoords = this.viewport.fromReal({ x: bbox.x, y: bbox.y });

		this.bbox = Object.assign({} , bbox, {
			x: viewCoords.x,
			y: viewCoords.y
		});
		return this.bbox;
	}

	toggle() {
		this.map.selectItem(this, !this.selected);
	}

	select(value = true) {
		this.selected = value;
		this.fresh();
	}

	fresh() {
		this.group.attr({
			transform: this.matrix
		});
	}

	delete() {
		this.group.remove();
		this.map.selectItem(this, false);
	}

	setPosition(point) { //set item position to absolute point
		const rz = this.viewport.getZoom(); // global viewport zoom
		const ro = this.viewport.getOffset(); // global viewport offset
		const newOffset = {
			x: (-ro.x + point.x) / rz,
			y: (-ro.y + point.y) / rz
		};
		Object.assign(this.offset, newOffset);
		this.fresh();
	}

	setZoom(zoom) {
		this.zoom *= zoom;
		this.fresh();
	}

	goUp() {
		this.map.stepUp(this);
		this.group.forward();
	}

	goDown() {
		this.map.stepDown(this);
		this.group.backward();
	}
}