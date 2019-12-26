import React from "react";
import PropTypes from "prop-types";
import template from "./timespot.template";
import { getPointHolder, clearSelection } from "common/utils";
import './timespot.component.less';

export class TimeSpot extends React.Component {
	static contextTypes = {
		t: PropTypes.func.isRequired,
		timeline: PropTypes.object.isRequired
	}

	state = {};
	_root = React.createRef();

	get root() {
		return this._root.current;
	}

	get timeline() {
		return this.spot.timeline;
	}

	constructor() {
		super(...arguments);
		this.spot = this.props.spot;
		this.isVirtual = !!this.props.isVirtual;
	}

	static contextTypes = {
		t: PropTypes.func.isRequired,
		timeline: PropTypes.object.isRequired
	}

	static getDerivedStateFromProps(props, state) {
		const { spot, selected, isVirtual } = props;
		const newState = Object.assign({}, state);
		if (state.initedSelected !== selected) {
			Object.assign(newState, { selected, initedSelected: selected });
		}
		if (state.spot !== spot) {
			Object.assign(newState, {
				spot,
				startOffsetX: spot.startOffsetX,
				endOffsetX: spot.endOffsetX,
				startDate: spot.startDate,
				endDate: spot.endDate,
				selected: selected || isVirtual
			});
		} else {
			if (state.startOffsetX !== spot.startOffsetX) newState.startOffsetX = spot.startOffsetX;
			if (state.endOffsetX !== spot.endOffsetX) newState.endOffsetX = spot.endOffsetX;
		}
		return newState;
	}

	componentDidMount() {
		const startPoint = this.root.querySelector(".start.point");
		const endPoint = this.root.querySelector(".end.point");

		const halt = event => {
			event.stopPropagation();
			event.preventDefault();
		};

		this.root.addEventListener('mousedown', halt);
		this.root.addEventListener('touchstart', halt);

		this.processors = {
			movePoint: e => this.movePoint(e),
			endDrag: e => this.endDrag(e)
		}

		startPoint.addEventListener('touchstart', e => this.startDrag(e, 'start'));
		startPoint.addEventListener('mousedown', e => this.startDrag(e, 'start'));

		if (endPoint) {
			endPoint.addEventListener('touchstart', e => this.startDrag(e, 'end'));
			endPoint.addEventListener('mousedown', e => this.startDrag(e, 'end'));
		}

		if (this.state.selected) this.setSelected(true);
	}

	setSelected(selected) {
		this.setState({ selected });
		const action = selected && 'Select' || 'Unselect';
		this.props[`onSpot${action}`] && this.props[`onSpot${action}`](this.spot);
	}

	select() {
		this.setSelected(true);
	}

	unselect() {
		this.setSelected(false);
	}

	toggle() {
		this.setSelected(!this.state.selected);
	}

	toggleLocked() {
		this.spot.toggleLocked();
	}

	startDraw(event, position) {
		if (this.isVirtual) {
			const startOffsetX = position;
			const endOffsetX = position;
			Object.assign(this.spot, { startOffsetX, endOffsetX });
			this.setState({ active: true, startOffsetX, endOffsetX, selected: true }, _ => this.startDrag(event, 'end'));
		}
	}

	startDrag(event, point) {
		if (!this.state.selected) {
			this.select();
			return;
		}

		if (this.spot.locked) return;

		this.pointType = point;

		document.addEventListener('touchmove', this.processors.movePoint);
		document.addEventListener('mousemove', this.processors.movePoint);
		document.addEventListener('touchend', this.processors.endDrag);
		document.addEventListener('mouseup', this.processors.endDrag);
	}

	movePoint(event) {
		clearSelection();
		const pholder = getPointHolder(event);
		const realShift = this.timeline.getRelativeLocation(pholder.pageX);
		const offset = realShift < 0 ? 0 : realShift > 100 ? 100 : realShift;

		this.spot[`${this.pointType}OffsetX`] = offset;

		this.setState({
			[`${this.pointType}OffsetX`]: offset,
		});

	}

	async endDrag() {
		document.removeEventListener('touchmove', this.processors.movePoint);
		document.removeEventListener('mousemove', this.processors.movePoint);
		document.removeEventListener('touchend', this.processors.endDrag);
		document.removeEventListener('mouseup', this.processors.endDrag);

		const point = this.state[`${this.pointType}OffsetX`];

		this.spot[`${this.pointType}OffsetX`] = point;

		if (this.props.onChange) await this.props.onChange(this.spot);

		if (this.isVirtual) {
			this.setState({ active: false });
		}
	}

	render() {
		return template.call(this);
	}
}
