import { Eventful } from 'common/eventful';

export class Viewport extends Eventful {

	offset = { x: 0, y: 0 };
	zoomFactor = 1;
	base = 1;
	_parent = null;

	get parent() { return this._parent; }

	constructor(scale, offset, base = 1) {
		super();
		this.zoomFactor = scale;
		this.base = base;
		this.setOffset(Object.assign({ x: 0, y: 0 }, offset));
	}

	setParent(parent) {
		this._parent = parent;
		parent.on('changeView', _ => this.apply());
	}

	setBase(base) {
		this.base = base;
		this.apply();
	}

	setViewPoint(zoom, point, base) { // means absolute data
		if (base !== undefined) this.base = base;
		this.setZoom(zoom);
		this.setOffset(point);
		this.apply();
	}

	setLocalViewPoint(zoom, point, base) { // means strong local data
		if (base) this.base = base;
		this.zoomFactor = zoom;
		this.offset.x = point.x;
		this.offset.y = point.y;
		this.apply();
	}

	get baseZoom() {
		return this.base;
	}

	get zoom() { // means local zoom
		return this.zoomFactor * this.base;
	}

	get localZoom() { return this.zoomFactor; }
	get localOffset() { return this.offset; }

	getZoom() { // means absolute zoom
		return this.zoom * this.parentZoom;
	}

	setZoom(zoom, base) { // means absolute zoom
		if (base !== undefined) this.base = base;
		this.zoomFactor = zoom / this.parentZoom / this.base;
	}

	setOffsetDelta(delta, force) { // means absolute offset
		const rz = this.parentZoom;
		const { x: dx, y: dy } = delta;
		this.offset.x += dx / rz;
		this.offset.y += dy / rz;
		if (force) this.apply();
	}

	setOffset(offset) { // means absolute offset
		const zf = this.parentZoom;
		this.offset.x = offset.x / zf;
		this.offset.y = offset.y / zf;
		this.apply();
	}

	getOffset() { // means absolute offset
		const pz = this.parentZoom;
		const po = this.parentOffset;
		let { x, y } = this.offset;
		x = x * pz + po.x;
		y = y * pz + po.y;
		return { x, y };
	}

	get parentZoom() {
		return this._parent && this._parent.getZoom() || 1;
	}

	get parentOffset() {
		return this._parent && this._parent.getOffset() || { x: 0, y: 0 };
	}

	applyZoomMultiplyer(mul, point) {
		this.zoomFactor *= mul;
		const dmul = mul - 1;
		const pz = this.parentZoom;
		let { x, y } = this.getOffset();

		let dx = (point.x - x) * dmul;
		let dy = (point.y - y) * dmul;

		if (this._parent) {
			dx /= pz;
			dy /= pz;
		}
		this.offset.x -= dx;
		this.offset.y -= dy;

		const movex = point.deltaX ? point.deltaX / pz : 0; // need for touchable zooming
		const movey = point.deltaY ? point.deltaY / pz : 0; // need for touchable zooming
		if(movex || movey) this.setOffsetDelta({x: movex, y: movey});
		this.apply();
	}

	apply() {
		this.trigger('changeView', { viewport: this });
	}

	getParamsByLocal(x, y, z) {
		var zoom = this.getZoom(), offset = this.getOffset();
		return {
			x: x + offset.x,
			y: y + offset.y,
			zoom: zoom * z
		};
	}

	// real point coords is a coord inside shape, view coords is a device coords;
	fromReal(point, offset) {
		const ro = this.getOffset();
		const rz = this.getZoom();
		if (offset) {
			ro.x += offset.x * rz;
			ro.y += offset.y * rz;
		}
		return {
			x: point.x * rz + ro.x,
			y: point.y * rz + ro.y
		};
	}

	toReal(point, offset) {
		const ro = this.getOffset();
		const rz = this.getZoom();
		if (offset) {
			ro.x += offset.x * rz;
			ro.y += offset.y * rz;
		}
		return {
			x: (point.x - ro.x) / rz,
			y: (point.y - ro.y) / rz
		};
	}

}