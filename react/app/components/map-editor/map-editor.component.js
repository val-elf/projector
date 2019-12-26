import React from "react";
import SVG from 'svg.js';
import PropTypes from "prop-types";
import { MapHost, LocationMap, ParentMap, MerchatorGrid, Boundary, Viewport } from "./map";
import template from './map-editor.template';
import { getPointHolder } from 'common/utils';
import { store } from '~/index';
import './map-editor.component.less';

export class MapEditor extends React.Component {
	static contextTypes = {
		t: PropTypes.func.isRequired
	};

	static childContextTypes = {
		locationEditor: PropTypes.object.isRequired
	}

	static getDerivedStateFromProps(props) {
		const { location } = props;
		const { parent } = location;
		const { location: parentLocation } = parent || { location: null };
		return {
			location,
			parent,
			parentLocation
		};
	}

	getChildContext() {
		return { locationEditor: this };
	}

	state = {};
	tools = {};

	clickHolder = event => this.clickMap(event);
	dragHolder = event => this.drag(event);
	startDragHolder = event => this.startDrag(event);
	mouseMoveHolder = event => this.mouseMove(event);
	endDragHolder = event => this.endDrag(event);
	zoomHolder = event => this.setZoom(event);
	mouseUpHolder = event => this.mouseUp(event);
	keyDownHolder = event => this.keyDown(event);
	keyUpHolder = event => this.keyUp(event);

	get tool() { return this.state.tool; }
	get location() { return this.state.location; }
	get parentLocation() { return this.state.parentLocation; }

	async componentDidMount() {
		this.unsubscriber = store.subscribe(_ => {
			const state = store.getState().Project;
			const { parent } = state;
			const { location: parentLocation } = parent;
			this.setState({ parent, parentLocation });
		});

		this.root.addEventListener('mousedown', this.startDragHolder);
		this.root.addEventListener('touchstart', this.startDragHolder);
		this.root.addEventListener('mousemove', this.mouseMoveHolder);
		this.root.addEventListener('wheel', this.zoomHolder);
		this.root.addEventListener('click', this.clickHolder);
		this.root.addEventListener('mouseup', this.mouseUpHolder);

		this.root.addEventListener('mouseenter', () => this.root.focus());
		this.root.addEventListener('mouseleave', () => this.root.blur());
		this.root.addEventListener('keydown', this.keyDownHolder);
		this.root.addEventListener('keyup', this.keyUpHolder);

		const { location,  parent } = this.state;
		if (parent) {
			await parent.location;
			if (!parent.location) {
				this.setState({ parent: null });
			} else this.setState({ parent });
		}

		this.baseViewport = new Viewport(location.scale, location.position.plain(), location.baseZoom);
		this.mapHost = new MapHost(SVG(this.root), this.baseViewport, this);

		this.mapHost.addMap(new ParentMap(parent ? parent.location : null, this.mapHost), 'parent');
		this.map = new LocationMap(location, this.mapHost);
		this.mapHost.addMap(this.map, 'base');
		this.mapHost.addMap(new MerchatorGrid(this.mapHost, this.map), 'merchator');

		this.boundary = new Boundary(this.mapHost, this.map);
		this.mapHost.addMap(this.boundary, 'boundary');

		this.baseViewport.apply();
		this.tools.panTool.select();
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.state.parentLocation !== prevState.parentLocation) {
			const { parent } = this.state;
			this.setParentLocation(parent);
		}
	}

	setParentLocation(parent) {
		const parentMap = this.mapHost.getMap('parent');
		parentMap.clear();
		if (parent && parent.location) parentMap.initLocation(parent.location);
	}

	componentWillUnmount() {
		this.root.removeEventListener('mousedown', this.startDragHolder);
		this.root.removeEventListener('touchstart', this.startDragHolder);
		this.root.removeEventListener('mousemove', this.mouseMoveHolder);
		this.root.removeEventListener('wheel', this.zoomHolder);
		this.root.removeEventListener('click', this.clickHolder);
		this.root.removeEventListener('mouseup', this.mouseUpHolder);
		this.unsubscriber();
	}

	get boundingRect() {
		return this.root.getBoundingClientRect();
	}

	fireDragEvent(event, isFinal) {
		let points = getPointHolder(event);
		const { tool } = this.state;
		if (points.length === undefined) points = [points];

		const cpoints = points.map(point => ({ x: point.pageX, y: point.pageY }));

		const shifts = cpoints.map((cpoint, index) => ({
			x: cpoint.x - this.ancor[index].x,
			y: cpoint.y - this.ancor[index].y
		}));

		const deltas = shifts.map((shift, index) => ({
			x: shift.x - this.shifts[index].x,
			y: shift.y - this.shifts[index].y
		}));

		this.shifts = shifts;
		const distance = this.shifts.some(shift => Math.abs(shift.x) + Math.abs(shift.y) > 0);

		if (!isFinal || distance) {
			tool.drag(this.mapHost);
			tool.process('drag', deltas, this.shifts.map(i => i), this.ancor.map(i => i), event);
		}
	}

	startDrag(event) {
		event.preventDefault();
		let points = getPointHolder(event);
		if (points.length === undefined) { //points of touch event
			points = [points];
		}

		this.ancor = points.map(point => ({
			x: point.pageX,
			y: point.pageY,
			ox: point.pageX - this.boundingRect.x,
			oy: point.pageY - this.boundingRect.y
		}));

		this.shifts = points.map(_ => ({ x: 0, y: 0 }));

		if (event instanceof MouseEvent) {
			document.addEventListener('mousemove', this.dragHolder);
			document.addEventListener('mouseup', this.endDragHolder);
		} else if (event instanceof TouchEvent) {
			document.addEventListener('touchmove', this.dragHolder);
			document.addEventListener('touchend', this.endDragHolder);
		}
	}

	drag(event) {
		if (event.movementX === 0 && event.movementY === 0) return;
		this.fireDragEvent(event);
	}

	keyDown(event){
		switch(event.code) {
			case 'Space':
				const { tool } = this;
				if (!this.storedTool && tool !== this.tools.panTool) {
					this.storedTool = tool;
					this.tools.panTool.select();
				}
				return;
		}
		this.tool.process('key', event.code);
	}

	keyUp(event) {
		switch(event.code) {
			case 'Space':
				if (this.storedTool) {
					this.storedTool.select();
					this.storedTool = null;
					return;
				}
				break;
		}
		this.tool.process('keyRelease', event.code);
	}

	endDrag(event) {
		if (event.type === 'touchend') {
			if (!this.shifts) {
				this.clickMap({
					pageX: this.position[0].x,
					pageY: this.position[0].y
				});
			}
		} else {
			this.fireDragEvent(event, true);
			document.removeEventListener('mousemove', this.dragHolder);
			document.removeEventListener('mouseup', this.endDragHolder);
			document.removeEventListener('touchmove', this.dragHolder);
			document.removeEventListener('touchend', this.endDragHolder);
		}
	}

	_eventProcessors = {};
	on(eventType, callback) {
		let _procs = this._eventProcessors[eventType];
		if (!_procs) {
			_procs = [];
			this._eventProcessors[eventType] = _procs;
		}
		_procs.push(callback);
	}

	trigger(eventType, ...params) {
		let _procs = this._eventProcessors[eventType];
		_procs && _procs.forEach(cb => cb(...params));
	}

	mouseMove(event) {
		this.trigger('mousemove', event);
	}

	mouseUp(event) {
		this.trigger('mouseup', event);
	}

	clickMap(event) {
		const point = {
			x: event.pageX - this.boundingRect.x,
			y: event.pageY - this.boundingRect.y
		};
		this.tool.click(this.map);
		this.tool.process('click', point, event);
	}

	setZoom(event) {
		event.preventDefault();
		const sign = event.wheelDeltaY > 0;
		const zoomFactor = event.shiftKey ? 1.001 : 1.1;
		const zoom = sign ? zoomFactor : 1 / zoomFactor;
		const x = event.pageX - this.boundingRect.x;
		const y = event.pageY - this.boundingRect.y;
		this.mapHost.moveZoom(zoom, { x, y }, event.ctrlKey);
	}

	createImage(image, file) {
		this.map.createNewImage(image, file);
	}

	selectTool(tool, select = true) {
		let { tool: selectedTool } = this.state;
		if (select) {
			if (tool === selectedTool) return;

			if (selectedTool) {
				selectedTool.unselect();
			}
			this.setState({ tool });
			tool.activate();
			if (this.props.onChangeTool) this.props.onChangeTool(tool);
		} else if (tool === selectedTool)
			delete this.state.selectedTool;
	}

	save() {
		const { location, parent } = this.state;
		const { viewport: { localOffset: offset, localZoom: zoom } } = this.mapHost;
		location.map = this.map.toJson();

		Object.assign(location, {
			map: this.map.toJson(),
			position: offset,
			scale: zoom
		});

		if (parent) {
			const { viewport: { localOffset: poffset, localZoom: pzoom } } = this.map;
			Object.assign(location.parent, {
				location: parent.location,
				position: poffset,
				scale: pzoom
			});
		}
		location.save();
	}

	render() {
		return template.call(this);
	}
}