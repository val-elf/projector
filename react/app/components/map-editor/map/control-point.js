import { Eventful } from 'projector/common/eventful';
import { getPointHolder } from 'projector/common/utils';
import utils from './2d-utils';

export class ControlPoint extends Eventful {
	radius = 1.5;

	get zoom() {
		return this.shape.viewport.getZoom();
	}

	constructor(point, shape, first) {
		super();
		this.shape = shape;
		this.place = point;
		this.point = shape.group.circle(this.radius).attr({
			cx: point.x,
			cy: point.y,
			fill: "brown", opacity: 1, stroke: "none", 'class': "control"
		});
		this.point.hide();

		if (first) {
			this.point.attr({ fill: 'white', stroke: 'brown', 'stroke-width': 1})
		}

		let dx, dy, fd = true;

		this.point.mouseover(() => {
			this.radius = 2.5;
			this.fresh();
		});

		this.point.mouseout(() => {
			this.radius = 1.5;
			this.fresh();
		});

		this.point.click(event => {
			this.map.tool.click(this);
		});

		this.point.mousedown(event => this.startDrag(event));
	}

	get map() {
		return this.shape.map;
	}

	dragHolder = event => this.drag(event);
	endDragHolder = event => this.endDrag(event);

	startDrag(event) {
		document.addEventListener('mousemove', this.dragHolder);
		document.addEventListener('mouseup', this.endDragHolder);
	}

	drag(event) {
		this.map.tool.drag(this);
	}

	setOffsetDelta(delta) {
		const rz = this.shape.viewport.getZoom();
		Object.assign(this.place, {
			x: this.place.x + delta.x / rz,
			y: this.place.y + delta.y / rz
		});
		this.fresh();
		this.shape.rebuild();
	}

	endDrag(event) {
		document.removeEventListener('mousemove', this.dragHolder);
		document.removeEventListener('mouseup', this.endDragHolder);
	}

	get isFirst() {
		return this.shape.firstPoint === this;
	}

	contain(point) {
		const real = this.shape.viewport.fromReal(this.place);
		const dist = utils.getDistance(real, point);
		return dist <= 2.5;
	}

	fresh() {
		this.point.attr({
			r: this.radius * 2 / this.zoom,
			cx: this.place.x,
			cy: this.place.y,
			'stroke-width': 1 / this.zoom
		});
		if (this.isFirst && this.shape.closed) {
			this.point.attr({
				fill: "brown",
				stroke: "none"
			});
		}
	}

	setZoom(zoom) {
		this.zoom = zoom;
		this.fresh();
	}

	setPosition(x, y) {
		this.point.attr({ cx: x, cy: y });
	}

	show(show = true) {
		if (show) this.point.show();
		else this.point.hide();
		this.fresh();
	}

	hide() {
		this.point.hide();
	}
}

export class ControlsList extends Array {
	constructor(shape, points) {
		super();
		this.shape = shape;
		this.group = shape.group;

		points.forEach(point => {
			const cpoint = new ControlPoint(point, shape);
			this.group.add(cpoint.point);
			this.push(cpoint);

			cpoint.on('drag', evt => {
				index = this.controls.indexOf(res);
				Object.assign(this.points[index], this.viewport.toReal({x: evt.x, y: evt.y }));
				this.render();
			});
		});

		this.shape.viewport.on('zoom', zoom => this.zoom(zoom));
	}

	get first() {
		return this[0];
	}

	zoom(zoom) {
		this.forEach(cp => cp.setZoom(zoom));
	}

	push(point) {
		super.push(...arguments);
		if (this.showed) this.render();
	}

	splice(...params) {
		const items = [...this];
		items.splice(...params);
		while(this.shift()) {};
		this.push(...items);
	}

	remove(index) {
		if (index < 0) return;
		const pt = this[index];
		this.group.removeElement(pt.point);
		this.splice(index, 1);
	}

	show() {
		this.showed = true;
		this.render();
	}

	hide() {
		this.showed = false;
		this.render();
	}

	fresh() {
		if (!this.showed) return;
		this.forEach(point => point.fresh());
	}

	render() {
		const bbox = this.shape.boundingBox;

		if (this.shape.closed && bbox.width < 100 && bbox.height < 100) {
			this.forEach(cp => cp.hide());
			return;
		}

		let pcontrol, pdist = 0, show;
		this.forEach((control, index) => {
			show = this.showed;
			const real = this.shape.viewport.fromReal(control.place);
			if (show && pcontrol) {
				const dist = utils.getDistance(pcontrol, real);
				pdist += dist;
				if (pdist < 10) {
					show = false;
				} else {
					pdist = 0;
				}
			}
			pcontrol = real;
			control.show(show);
		});
	}
}