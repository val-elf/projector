// import React from 'react';
// import { hex2RGB } from 'common/colors';
import { clearSelection } from 'common/utils';
import { CommonTool, CommonToolState } from '../common-tool.component';
import { Cursor } from '../../document/cursor';
import { BrushOptions } from '../options/brush-options.component';
import { BrushManager, BrushState, getOpacity } from '../brush-utils';
import template from './brush.template.rt';
import './brush.component.less';
import { IPointPosition } from '../../models/editor.model';
import { storage } from '../../store/store';
import { OverlayMappingEnum } from 'controls/picture-editor/document/models';

enum EPenButton {
	tip = 0x1, // left mouse, touch contact, pen contact
	barrel = 0x2, // right mouse, pen barrel button
	middle = 0x4, // middle mouse
	eraser = 0x20 // pen eraser button
}

const brush = new BrushManager();

export class Brush extends CommonTool<{}, BrushState> {

	/*get layer() {
		return this.activeLayer.workingLayer;
	}

	get ctx() {
		return this.layer.context;
	}

	testBrush() { // only for tests
		const ctx = this.layer.context;
		ctx.putImageData(this.test2(), 0, 0);
		this.page.redraw();
	}*/
	static getOptionsControl() {
		return BrushOptions;
	}

	static getDerivedStateFromProps(props, state) {
		const newState = Object.assign({}, state);
		const { canvas, color } = props;
		if (newState.canvas !== canvas) newState.canvas = canvas;
		if (newState.color !== color) newState.color = color;
		return newState;
	}

	state = {
		hardness: 1,
		opacity: 1,
		flow: 1,
		useTilt: true
	};

	size = 1;
	hardness = 1;
	roundness = 1;
	rotate = 0;
	flow = 1;
	opacity = 1;
	stepRatio = 0.1;
	minWidth = 0.05;
	composite = OverlayMappingEnum.sourceOver;

	pts: IPointPosition[];
	lpoint: IPointPosition;
	points: IPointPosition[];
	pixelData: ImageData;
	distance: number;
	iterations: number;
	_cursor: Cursor;

	get color() { return storage.state.color; }
	get name() { return Brush; }

	getRealOpacity(stepRatio, flow) {
		return getOpacity(Math.round(1 / stepRatio), flow);
	}

	startDraw = evt => {
		if (!this.layerState) return;
		this.pts = [];
		const pressure = evt.pointerType === 'mouse' ? 1 : evt.pressure;
		clearSelection();
		// if (this.paused) return;

		const { buttons } = evt;

		/* if (!this.paused && !this.isEraser && [EPenButton.eraser, EPenButton.barrel].includes(buttons)) {
			this.editor.temporaryActivate('eraser', evt);
			return;
		}*/

		this.layerState.setComposite(this.composite);
		this.layerState.setOpacity(this.opacity);
		const { width, height } = this.layerState.state;
		this.pixelData = new ImageData(width, height);

		document.addEventListener('pointermove', this.draw);
		document.addEventListener('pointerup', this.endDraw);
		this.points = [];
		this.lpoint = null;

		const { color } = this;
		const { stepRatio, flow, size: originSize, hardness, roundness, rotate } = this;
		const rgba = Object.assign({}, color, { a: this.getRealOpacity(stepRatio, flow) });
		const size = pressure * originSize;
		const pos = {
			color: rgba,
			size,
			hardness,
			roundness,
			rotate,
			...this.viewport.getLayerLocation({ x: evt.pageX, y: evt.pageY })
		};

		this.lpoint = pos;
		this.pts.push(pos);
		brush.drawPoint(pos, pos.size, this.pixelData);
		this.layerState.putImageData(this.pixelData);
		// this.viewport.redraw(); todo: subscribe for update data
		this.distance = 0;
		this.iterations = 0;
		// this.lock();
	}

	draw = evt => {
		evt.preventDefault();
		/* if (evt.shiftKey && this.lpoint) { //lock direction
			const dx = Math.abs(nx - this.lpoint.x);
			const dy = Math.abs(ny - this.lpoint.y);
			const lockAxis = dx > dy ? 'y' : 'x';
			const dirValue = lockAxis == 'x' ? this.lpoint.x : this.lpoint.y;
			lockDirection = { [lockAxis]: dirValue };
			console.log('LDIR', lockDirection, dx, dy, lockAxis);
		}*/
		this.iterations++;
		clearSelection();
		const { size: originSize, flow, color, hardness, roundness, rotate } = this;
		let { stepRatio } = this;
		const pressure = evt.pointerType === 'mouse' ? 1 : evt.pressure;

		const tilt = { x: evt.tiltX, y: evt.tiltY };
		if (roundness !== undefined) stepRatio *= roundness;
		// const rotate = evt.twist;

		const rgba = Object.assign({}, color, { a: this.getRealOpacity(stepRatio, flow) });
		let size = Math.round(pressure * originSize * 100) / 100;
		if (size < 0.1) size = 0.1;
		const pos = {
			color: rgba,
			size,
			hardness,
			roundness,
			rotate,
			...this.viewport.getLayerLocation({ x: evt.pageX, y: evt.pageY })
		};

		if (this.lpoint) {
			const npoint = brush.drawLine(this.lpoint, pos, this.pixelData, stepRatio);
			this.layerState.putImageData(this.pixelData);
			if (npoint) {
				this.lpoint = npoint;
				// this.points.push(npoint);
				// this.viewport.redraw(); - todo: subscribe viewport to redraw
			} else this.lpoint.size = size;
		} else this.lpoint = pos;
	}

	endDraw = evt => {
		document.removeEventListener('pointermove', this.draw);
		document.removeEventListener('pointerup', this.endDraw);
		this.activeLayer.apply();
		this.finishDraw();
		// this.unlock();
	}

	finishDraw() { }

	activate() {
		if (this.isActive) return;
		this.viewport.window.addEventListener('pointerdown', this.startDraw);
		document.addEventListener('keydown', this.keyCheck);
		// super.activate();
		//testBrush();
	}

	deactivate() {
		// super.deactivate();
		this.viewport.window.removeEventListener('pointerdown', this.startDraw);
		document.removeEventListener('keydown', this.keyCheck);
	}

	/*freeze() {
		this.page.removeEventListener('keydown', this.keyCheck);
	}

	unfreeze() {
		this.page.addEventListener('keydown', this.keyCheck);
	}*/

	keyCheck = evt => {
		// console.log('KCheck', evt);
		switch(evt.code) {
			case 'BracketLeft': {
				if (evt.shiftKey && evt.ctrlKey) this.decreaseHardness();
				else if (evt.shiftKey) this.decreaseFlow();
				else if (evt.ctrlKey) this.decreaseOpacity();
				else this.decreaseSize();
			}

			break;
			case 'BracketRight': {
				if (evt.shiftKey && evt.ctrlKey) this.increaseHardness();
				else if (evt.shiftKey) this.increaseFlow();
				else if (evt.ctrlKey) this.increaseOpacity();
				else this.increaseSize();
			}
			break;
		}
	}

	decreaseHardness() {
		this.setBrushHardness(this.hardness - 0.05);
	}

	increaseHardness() {
		this.setBrushHardness(this.hardness + 0.05);
	}

	decreaseFlow() {
		this.setBrushFlow(this.flow - 0.05);
	}

	increaseFlow() {
		this.setBrushFlow(this.flow + 0.05);
	}

	decreaseOpacity() {
		this.setBrushOpacity(this.opacity - 0.05);
	}

	increaseOpacity() {
		this.setBrushOpacity(this.opacity + 0.05);
	}

	decreaseSize() {
		let bchange = Math.round(this.size / 10);
		if (bchange < 1) bchange = 1;
		this.setBrushSize(this.size - bchange);
	}

	increaseSize() {
		let bchange = Math.round(this.size / 10);
		if (bchange < 1) bchange = 1;
		this.setBrushSize(this.size + bchange);
	}


	getCursor() {
		if (!this._cursor) {
			this._cursor = new Cursor();
		}
		this.refreshCursor();
		return this._cursor;
	}

	refreshCursor() {
		const sz = this.size * storage.state.zoom;
		this._cursor.setSize(sz, sz);
		this._cursor.setLocation(sz / 2, sz / 2);
		const cctx = this._cursor.context;
		cctx.beginPath();
		if (sz > 4) {
			let r = sz / 2;
			cctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
			cctx.lineWidth = 1.5;
			cctx.arc(r, r, r - 1, 0, 2 * Math.PI);
			cctx.stroke();
			cctx.beginPath();
			cctx.lineWidth = 0.5;
			cctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
			cctx.arc(r, r, r - 2, 0, 2 * Math.PI);
			cctx.stroke();
		}
		this._cursor.toggleChange();
	}

	setBrushSize(size) {
		if (size < 1) return;
		if (size > 120) return;
		this.size = size;
		this.refreshCursor();
	}

	setBrushHardness(hardness) {
		if (hardness < 0) hardness = 0;
		if (hardness > 1) hardness = 1;
		this.hardness = hardness;
	}

	setBrushFlow(flow) {
		if (flow < 0) flow = 0;
		if (flow > 1) flow = 1;
		this.flow = flow;
	}

	setBrushOpacity(opacity) {
		if (opacity < 0) opacity = 0;
		if (opacity > 1) opacity = 1;
		this.opacity = opacity;
	}

	render() {
		return template.call(this);
	}
}