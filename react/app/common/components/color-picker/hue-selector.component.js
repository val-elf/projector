import React from 'react';
import { RGB2hex, HSV2RGB } from './colors';
import {
	getVector,
	toGrad,
	distance,
	cosVectors,
	setVectorLength,
	heightFactor,
	sinVectors
} from './vectors';
import { clearSelection } from '../../utils';
import template from './hue-selector.template.rt';

export class HueSelector extends React.Component {

	static definePickerPosition(saturation, value, a) {
		const res = { x: 0, y: 0 };
		const h = a * heightFactor;
		const al = 60 * saturation;
		const av = Math.abs(30 - al);
		const vmax = h / Math.cos(Math.PI * av / 180);
		const vl = vmax * value;
		res.x = vl * Math.sin(Math.PI * al / 180);
		res.y = a - vl * Math.cos(Math.PI * al / 180);
		return res;
	}

	static getDerivedStateFromProps(props, state) {
		const newState = Object.assign({}, state);
		const { hsv, radius, thickness } = props;
		newState.innerRadius = radius - thickness;

		if (hsv !== newState.hsv) {
			newState.hsv = hsv;
			const { hue, saturation, value } = hsv;
			Object.assign(newState, { hue, saturation, value });
			Object.assign(newState, { pickerPos: HueSelector.definePickerPosition(saturation, value, (radius - thickness) * Math.sqrt(3) * 0.9) });
		}
		if (radius !== newState.radius) newState.radius = radius;
		if (thickness !== newState.thickness) newState.thickness = thickness;
		return newState;
	}

	state = {
		pickerPos: { x: 0, y: 0 },
		hsv: { hue: 0, saturation: 0, value: 0 }
	};

	donutRef = React.createRef();
	get donut() { return this.donutRef.current; }
	donutValueRef = React.createRef();
	get donutValue() { return this.donutValueRef.current; }
	holderRef = React.createRef();
	get holder() { return this.holderRef.current; }
	innerRef = React.createRef();
	get inner() { return this.innerRef.current; }

	get tcolorPosition() {
		const { radius, thickness } = this.state;
		return {
			x: (radius - thickness) / 2 * 1.1 + thickness,
			y: radius - this.valueWidth / 2,
			cx: this.valueWidth * Math.sqrt(3) / 6,
			cy: this.valueWidth / 2
		};
	}

	get valueWidth() {
		return this.innerRadius * Math.sqrt(3) * 0.9;
	}

	get innerRadius() {
		const { radius, thickness } = this.state;
		return radius - thickness;
	}

	get cleanColor() {
		const { hue } = this.state;
		return RGB2hex(HSV2RGB(hue, 1, 1));
	}

	fillHolder(context) {
		const storage = context.createImageData(context.canvas.width, context.canvas.height);
		const { data, width, height } = storage;
		const pi = Math.PI;
		const r = width / 2;
		const q = a => a * a;
		const angles = {};
		for (let j = 0; j < height; j++) {
			for (let i = 0; i < width; i++) {
				let x = i - r;
				let y = r - j;
				const dst = Math.sqrt(q(x) + q(y));
				if (dst > r) continue;
				let angle = Math.atan(x / y);
				if (y < 0) angle += pi;
				else if (x < 0) angle += 2 * pi;
				angle = angle * 180 / pi;
				angles[angle] = true;
				const p = (j * width + i) * 4;
				const rgb = HSV2RGB(angle, 1, 1);
				data[p] = rgb.r;
				data[p + 1] = rgb.g;
				data[p + 2] = rgb.b;
				data[p + 3] = 255;
			}
		}
		context.putImageData(storage, 0, 0);
	}

	componentDidMount() {
		this.holder.addEventListener('pointerdown', this.startDragMarker);
		this.donutValue.addEventListener('pointerdown', this.startDragPicker);
		this.inner.addEventListener('pointerdown', this.startDragInner);

		const holderImg = document.createElement('canvas');
		const hctx = holderImg.getContext('2d');
		const { width, height } = { width: 500, height: 500 };
		holderImg.width = width;
		holderImg.height = height;
		this.holder.appendChild(holderImg);
		this.fillHolder(hctx);
	}

	componentDidUpdate(pprops, pstate) {
		const { hue, saturation, value } = this.state;
		if (pstate.hue !== hue || pstate.saturation !== saturation || pstate.value !== value) {
			if (this.props.onChange) this.state.hsv = this.props.onChange({ hue, saturation, value });
		}
	}

	componentWillUnmount() {
		this.holder.removeEventListener('pointerdown', this.startDragMarker);
		this.donutValue.removeEventListener('pointerdown', this.startDragPicker);
		this.inner.addEventListener('pointerdown', this.startDragInner);
	}

	defineColor() {
		let { saturation, value, pickerPos } = this.state;
		const a = this.valueWidth;
		const h = a * heightFactor;
		const al = Math.acos(cosVectors({ x: 0, y: -1 }, { x: pickerPos.x, y: pickerPos.y - a }));
		const vl = (a - pickerPos.y) / Math.cos(al);
		const vm = h / Math.cos(Math.abs(Math.PI / 6 - al));
		saturation = al * 3 / Math.PI;
		value = vl / vm;
		this.setState({ saturation, value });
	}

	startDragInner = evt => {
		this.innerAncor = { x: evt.pageX, y: evt.pageY };
		document.addEventListener('pointermove', this.moveInner);
		document.addEventListener('pointerup', this.endDragInner);
	}

	moveInner = evt => {
		clearSelection();
		const delta = { x: evt.pageX - this.innerAncor.x, y: evt.pageY - this.innerAncor.y };
		this.innerAncor = { x: evt.pageX, y: evt.pageY };
		this.props.onDragPicker(delta);
	}

	endDragInner = evt => {
		document.removeEventListener('pointermove', this.moveInner);
		document.removeEventListener('pointerup', this.endDragInner);
	}

	startDragPicker = evt => {
		clearSelection();
		evt.stopPropagation();
		document.addEventListener('pointermove', this.movePicker);
		document.addEventListener('pointerup', this.endMovePicker);
		const valueBoundary = this.donutValue.getBoundingClientRect();
		this.pickerAncor = {
			x: evt.pageX,
			y: evt.pageY,
			xo: valueBoundary.left,
			yo: valueBoundary.top,
			tpoints: []
		};
		const { pickerPos } = this.state;
		Object.assign(pickerPos, { x: evt.pageX - this.pickerAncor.xo, y: evt.pageY - this.pickerAncor.yo });
		this.setState({ pickerPos });
	}

	movePicker = async evt => {
		clearSelection();
		const delta = { x: evt.pageX - this.pickerAncor.x, y: evt.pageY - this.pickerAncor.y };
		Object.assign(this.pickerAncor, { x: evt.pageX, y: evt.pageY });
		const elAbove = document.elementFromPoint(this.pickerAncor.x, this.pickerAncor.y);
		if (elAbove !== this.donutValue) {
			// find nearest corner
			const pcursor = { x: evt.pageX - this.pickerAncor.xo, y: evt.pageY - this.pickerAncor.yo };
			const a = this.valueWidth; const h = this.valueWidth * heightFactor;
			const ps = [{ x: 0, y: 0 }, { x: 0, y: a }, { x: h, y: a / 2 }];
			const nearest = ps.reduce((res, point) => {
				const dst = distance(point, pcursor);
				if (!res.distance || dst < res.distance) {
					res.point = point;
					res.distance = dst;
				}
				return res;
			}, { point: null, distance: null }).point;
			if (nearest) {
				const pc = { x: h / 3, y: a / 2 };
				const vcorner = getVector(pc, nearest);
				const vcursor = getVector(pc, pcursor);
				const cos = cosVectors(vcorner, vcursor);
				const alpha = 3 * Math.cos(Math.PI / 3 - Math.acos(cos));
				const lng = h / alpha;
				const rcursor = setVectorLength(vcursor, lng);
				const { pickerPos } = this.state;
				Object.assign(pickerPos, { x: rcursor.x + pc.x, y: rcursor.y + pc.y });
				await this.setState({ pickerPos });
			}
		} else {
			const { pickerPos } = this.state;
			pickerPos.x += delta.x;
			pickerPos.y += delta.y;
			await this.setState({ pickerPos });
		}
		this.defineColor();
	}

	endMovePicker = evt => {
		document.removeEventListener('pointermove', this.movePicker);
		document.removeEventListener('pointerup', this.endMovePicker);
		this.defineColor();
	}

	startDragMarker = evt => {
		clearSelection();
		let { hue, radius } = this.state;
		document.addEventListener('pointermove', this.moveDragMarker);
		document.addEventListener('pointerup', this.endDragMarker);
		const bndr = this.donut.getBoundingClientRect();
		this.ancor = { x: evt.pageX, y: evt.pageY, left: bndr.left, top: bndr.top };
		const pos = { x: this.ancor.x - this.ancor.left, y: this.ancor.y - this.ancor.top };
		this.startMarkerVector = { x: pos.x - radius, y: pos.y - radius };
		const v0 = { x: 0, y: -1 };
		const cosa = toGrad(Math.acos(cosVectors(v0, this.startMarkerVector)));
		const sina = sinVectors(v0, this.startMarkerVector);
		hue = sina < 0 ? cosa : 360 - cosa;
		this.ancor.hue = hue;
		const smlength = Math.sqrt(this.startMarkerVector.x * this.startMarkerVector.x + this.startMarkerVector.y * this.startMarkerVector.y);
		this.startMarkerVector.x /= smlength;
		this.startMarkerVector.y /= smlength;
		this.setState({ hue });
	}

	moveDragMarker = evt => {
		clearSelection();
		evt.stopPropagation();
		const { radius } = this.state;
		let { hue, left, top } = this.ancor;
		const pos = { x: evt.pageX - left, y: evt.pageY - top };
		const newVector = { x: pos.x - radius, y: pos.y - radius };
		const vl = Math.sqrt(newVector.x * newVector.x + newVector.y * newVector.y);
		newVector.x /= vl;
		newVector.y /= vl;
		const mul = newVector.x * this.startMarkerVector.x + newVector.y * this.startMarkerVector.y;
		const vmul = newVector.y * this.startMarkerVector.x - newVector.x * this.startMarkerVector.y;
		const cos = Math.acos(mul);
		const delta = vmul > 0 ? cos : 2 * Math.PI - cos;
		const angle = toGrad(delta);
		hue += angle;
		hue = hue % 360;
		this.setState({ hue });
	}

	endDragMarker = evt => {
		document.removeEventListener('pointermove', this.moveDragMarker);
		document.removeEventListener('pointerup', this.endDragMarker);
	}

	render() {
		return template.call(this);
	}
}