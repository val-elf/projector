import { ControlPoint, ControlsList } from './control-point';
import { MapItem } from './map-item';
import utils from './2d-utils.js';

const shapeColors = [
	'#ee82ee',
	'#61c068',
	'#4ac1ce',
	'#3766bd',
	'#6c4ea7',
	'#6d2c83',
	'#e97091',
	'#dd452b',
	'#eeae1a',
	'#9fde29'
];

export class Shape extends MapItem {
	controls = [];
	points = [];

	constructor(map, data) {
		super(map, undefined, undefined, group => group.path().attr({
				'stroke-width': 1,
				opacity: 0.7,
				'stroke': ''
			})
		);

		this.points = [...(data && data.shape || [])];
		this.offset = data && data.offset || { x: 0, y: 0 };

		this.wandering = this.group.circle().attr({fill: '#B340E3', stroke: '#AE14FA', r: 10, opacity: 0.5}).hide();
		this.wandering.click(event => this.map.tool.click({ type: 'wandering', segment: this.segment, owner: this }));

		this.controls = new ControlsList(this, this.points);
		this.closed = this.points.length > 2;
		this._name = data.name;

		this.rebuild();

		const colorIndex = this.map.items
			.filter(item => item instanceof Shape)
			.length % shapeColors.length
		;
		this.color = shapeColors[colorIndex];
		this.stroke = utils.darkenColor(shapeColors[colorIndex], 40);


		this.item.mouseover(event => this.hovered = true);
		this.item.mouseout(event => this.hovered = false);

		this.viewport.on('zoom', zoom => this.changeViewportZoom(zoom));
		this.fresh();
	}

	toJson() {
		return {
			shape: [...this.points],
			offset: this.offset
		};
	}

	get name() {
		if (this._name) return this._name;
		const pos = this.map.items.indexOf(this);
		const index = this.map.items.reduce((res, item, index) => {
			if (index < pos && item instanceof Shape) res ++;
			return res;
		}, 1);
		return `Shape ${index}`;
	}

	select(value = true) {
		if (!value) {
			this.wandering.hide();
			this.hideControls();
		}
		super.select(value);
	}

	get strokeColor() {
		return this.selected ? this.stroke : '';
	}

	get opacity() {
		return this.selected ? 1 : this.locked ? 0.3 : 0.7;
	}

	changeViewportZoom(zoom) {
		if (this.controls.showed) this.controls.render();
		this.fresh();
	}

	fresh() { // when changing state of shape (selection, editing etc.)
		super.fresh();
		const rz = this.viewport.getZoom();

		this.wandering.attr({
			r: 10 / rz,
			'stroke-width': 1 / rz
		});

		this.item.attr({
			fill: this.color,
			stroke: this.strokeColor,
			opacity: this.opacity,
			'fill-opacity': this.closed ? 1: 0.5,
			'stroke-width': 1.5 / rz
		});
		this.controls.fresh();
	}

	showControls() {
		if (this.selected) this.controls.show();
	}

	hideControls() {
		this.controls.hide();
	}

	get firstPoint() {
		return this.controls.first;
	}

	getPathString() {
		const toString = point => `${point.x},${point.y}`;
		const pointType = 'L ';

		let res = this.points.reduce((res, point, index) => {
			const ptype = index === 0 ? 'M ' : index === 1 ? pointType : '';
			res += `${ptype}${toString(point)} `;
			return res;
		}, '');

		if(this.closed) res += "Z";
		return res;
	}

	close() {
		this.closed = true;
		this.rebuild();
		this.fresh();
		if (this.controls.showed) this.controls.render();
	}

	setZoom(zoom) {
		// super.setZoom(zoom);
		// return to zoom = 1, but all points should multiple on zoom
		this.points.forEach(point => { 
			point.x *= zoom;
			point.y *= zoom;
		});
		this.rebuild();
	}

	normalize() {
		if (!this.closed) return;
		const bbox = this.item.node.getBBox();
		const needNormalize = Math.round(bbox.x * 100) != 0 || Math.round(bbox.y * 100);

		if (needNormalize) {
			this.points.forEach(point => {
				point.x -= bbox.x;
				point.y -= bbox.y;
			});
			this.offset.x += bbox.x;
			this.offset.y += bbox.y;
			super.fresh();
			this.rebuild();
		}
	}

	rebuild() { // call only when modifying path
		if(this.points.length > 0) {
			const pathString = this.getPathString();
			this.item.attr("d", pathString);
			this.normalize();
		}
	}

	addPoint(point, index) {
		const viewpoint = this.viewport.toReal(point);
		viewpoint.x -= this.offset.x;
		viewpoint.y -= this.offset.y;
		this.addRealPoint(viewpoint, index);
	}

	addRealPoint(point, index) {
		const isStart = !this.controls.length;
		if (index === undefined) this.points.push(point);
		else this.points.splice(index, 0, point);
		const controlPoint = new ControlPoint(point, this, isStart);
		this.controls.push(controlPoint);
		this.group.add(controlPoint.point);
		this.rebuild();
	}

	addPointAt(point, index) {
		this.addRealPoint(point, index);
	}

	removePoint(index) {
		index = index || this.points.length - 1;
		if (index > -1) {
			this.points.splice(index, 1);
			const cp = this.controls[index];
			this.controls.remove(index);
			this.rebuild();
		}
	}

	detectNearestPoint(toPoint, radius) {
		const zoom = this.viewport.getZoom();
		toPoint = this.viewport.toReal(toPoint, this.offset);
		radius = radius / zoom;


		if(this.points.length < 2) return;
		const psd = [];
		let cp, ld, lp, rp, lind, rind;

		this.points.forEach((p1, index) => {
			if(this.points.length === 2 && index === 1) return;
			if(!this.closed && index === this.points.length -1) return;

			let ind2 = this.points.length - 1 > index ? index + 1 : 0,
				p2 = this.points[ind2];

			if(!utils.inZone(toPoint, p1, p2, radius)) return;

			psd.push([p1,p2]);

			const crossPoint = utils.getCross(toPoint, p1, p2);
			if(!crossPoint) return;

			const dist = utils.getDistance(toPoint, crossPoint);
			if(dist < radius && (!cp || dist < ld)) {
				cp = crossPoint;
				ld = dist;
				lp = p1;
				rp = p2;
				lind = index;
				rind = ind2;
			}
		});

		if(cp){
			this.segment = {point: cp, left: lp, right: rp, lind: lind, rind: rind};
			if(this.wandering.isHidden()) this.wandering.show();
			this.wandering.attr({cx: cp.x, cy: cp.y, r: 10 / zoom, 'stroke-width': 1 / zoom});
		} else {
			if(!this.wandering.isHidden()) this.wandering.hide();
			this.segment = null;
		}
	}
}