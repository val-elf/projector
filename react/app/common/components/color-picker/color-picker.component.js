import React from 'react';
import PropTypes from 'prop-types';
import template from './color-picker.template';
import { HSV2RGB, getLightness, RGB2HSV, hex2RGB, RGB2hex } from './colors';
import './color-picker.component.less';

let path = document.querySelector('#clipper path');
(() => {
	if (path) return;
	const xmlns = "http://www.w3.org/2000/svg";
	const svg = document.createElementNS(xmlns, 'svg');
	svg.classList.add('clipper');
	svg.innerHTML = `<clipPath id="clipper" clipPathUnits="objectBoundingBox">
		<path d="M 0.499 0.501 m 0 -0.501
			a 0.501 0.501 0 1 0 0.000001 0 Z
			M 0.5 0.168
			a 0.332 0.332 0 1 1 -0.000001 0 Z"></path>
		</clipPath>
		<clipPath id="triangular" clipPathUnits="objectBoundingBox">
		<path d="M 0 0
			l 0.8660 0.5
			l -0.8660 0.5
			Z"></path>
		</clipPath>
	`;
	document.body.appendChild(svg);
	path = svg.querySelector('path');
})();

const recalcPath = (radius, thickness) => {
	if (!path) return;
	const str = `M 0.499 0.501 m 0 -0.501
        a 0.501 0.501 0 1 0 0.000001 0 Z
        M 0.5 ${ thickness / radius / 2}
        a ${ (radius - thickness) / radius / 2} ${(radius - thickness) / radius / 2} 0 1 1 -0.000001 0 Z`;
	path.setAttribute('d', str);
}

export class ColorPicker extends React.Component {
	static contextTypes = {
		t: PropTypes.func.isRequired
	};

	static getDerivedStateFromProps(props, state) {
		const newState = Object.assign({}, state);
		let { radius, thickness, value, show } = props;
		let changed = false;
		if (!radius) radius = 90;
		if (!thickness) thickness = 20;
		if (newState.radius !== radius) {
			newState.radius = radius;
			changed = true;
		}
		if (newState.thickness !== thickness) {
			newState.thickness = thickness;
			changed = true;
		}
		if (value && newState.svalue !== value) {
			console.log('CVALUE', value);
			newState.svalue = value;
			newState.value = value;
			newState.hsv = RGB2HSV(newState.value);
		}
		if (show !== newState.show) {
			newState.show = show;
			if (show && newState.parent) {
				const { left, top, width } = newState.parent.getBoundingClientRect();
				if (newState.x === undefined || newState.y === undefined)
					Object.assign(newState, { x: left - radius * 2 - width - 10, y: top });
			}
		}
		if (changed) recalcPath(radius, thickness);
		return newState;
	}

	state = {
		value: { r: 255, g: 255, b: 255 },
		hsv: { hue: 0, saturation: 0, value: 1 },
		open: true
	};

	pickerRef = React.createRef();
	get picker() { return this.pickerRef.current; }

	get radius() { return this.state.radius; }
	get thickness() { return this.state.thickness; }
	get lightness() { return getLightness(this.state.value) };

	get color() {
		const { value } = this.state;
		return RGB2hex(value);
	}

	get invColor() {
		const { hsv } = this.state;
		let { hue, saturation, value } = hsv;
		hue = (hue + 40) % 360;
		saturation = 0;
		value = value < 0.5 ? 1 : 0;
		const res = RGB2hex(HSV2RGB(hue, saturation, value));
		return res;
	}

	componentDidMount() {
		const parentNode = this.picker.parentNode;
		this.setState({ parent: parentNode });
		document.body.appendChild(this.picker);
	}

	componentWillUnmount() {
		document.body.removeChild(this.picker);
	}

	moveColorPicker(delta) {
		let { x, y } = this.state;
		x += delta.x;
		y += delta.y;
		this.setState({ x, y });
	}

	changeColor(hsv) {
		const { hue, saturation, value } = hsv;
		const rgb = HSV2RGB(hue, saturation, value);
		this.setState({ value: rgb, hsv });
		if (this.props.onChange) this.props.onChange(rgb);
		return hsv;
	}

	render() {
		return template.call(this);
	}
}