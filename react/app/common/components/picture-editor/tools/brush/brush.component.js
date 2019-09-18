// import React from 'react';
import { hex2RGB } from 'projector/common/colors';
import { clearSelection } from 'projector/common/utils';
import { CommonTool } from '../common-tool.component';
import { Cursor } from '../../document/cursor';
import { BrushOptions } from '../options/brush-options.component';
import { BrushManager } from '../brush-utils';
import { testPoints } from './points.test';
import template from './brush.template.rt';
import './brush.component.less';

const EPenButton = {
	tip: 0x1, // left mouse, touch contact, pen contact
	barrel: 0x2, // right mouse, pen barrel button
	middle: 0x4, // middle mouse
	eraser: 0x20 // pen eraser button
}

const brush = new BrushManager();

const getPoints = (p1, p2, color, count) => {
	const hardness = 1;
	let width = p1.width;

	const dx = (p2.x - p1.x) / count;
	const dy = (p2.y - p1.y) / count;
	const dw = Math.round((p2.width - p1.width) / count * 100) / 100;
	const res = [];
	const pt = Object.assign({}, p1);
	for (var i = 0; i <= count; i++) {
		res.push(
			Object.assign({
				hardness,
				color,
			}, pt, {
				width: Math.round(width * 100) / 100,
			})
		);
		pt.x += dx;
		pt.y += dy;
		width += dw;
	}
	return res;
}

const dpoints = (p1, p2, opacity, count, data) => {
	let lpoint;
	let stepRatio = 0.1;
	opacity = opacity || 1;

	const pts = getPoints(p1, p2, { r: 128, g: 128, b: 128, a: opacity }, count);
	pts.forEach(pt => {
		if (lpoint) brush.drawLine(lpoint, pt, data, stepRatio);
		lpoint = pt;
	});

}

function outPtss(data) {
	let lp = null;
	testPoints.forEach(pt => {
		if (lp) brush.drawLine(lp, pt, data, 0.1);
		lp = pt;
	});
}

var getFullCount = a => {
	var res = 0;
	var al = 0;
	var k = 1 - a;
	var x = 0;
	while(res < 1) { al += a * Math.pow(k, x); res = Math.round(al * 1000) /1000; x ++;}
	return x - 1;
}

var getOpacity = (steps, alpha) => {
	return Math.round(1000 * (1 - Math.pow(1 - alpha, 1 / steps))) / 1000;
}

export class Brush extends CommonTool {

	test1() {
		let x = 10;
		let y = 70;
		let w = 2.05;
		const res = new ImageData(800, 800);
		for (let i = 0; i < 6; i ++) {
			dpoints(
				{ x: x, y, width: w, hardness: 1 },
				{ x: x + 300, y: y + 300 , width: w + 0.25, hardness: 1 },
				0.5,
				10,
				res
			);
			w += 0.025;
			y += 10;
		}

		//outPtss(res);
		return res;
	}

	test2() {
		const red = { r: 255, g: 0, b: 0, a: 1 };
		const rdata = new ImageData(800, 500);
		const hardness = 0.01;
		const frame = 180;
		const shift = 0;

		let c = 0;
		for (var i = frame * 30 + shift; i < frame * 30 + 1 + shift; i ++) {
			const r = i * 0.01;
			const width = r * 2;
			const res = brush.fillSpot(r, hardness, 1, 0, red);
			brush.drawTo(rdata, res, { x: 70 + c * 120, y: 40 });
			/* dpoints(
				{ x: 70 + c * 70, y: 60, width, hardness },
				{ x: 70 + c * 70 + 200, y: 350, width: width + 1, hardness },
				1,
				100, rdata
			);*/
			c ++;
		}
		return rdata;
	}

	testBrush() { // only for tests
		this.layer = this.activeLayer.workingLayer;
		const ctx = this.layer.context;
		ctx.putImageData(this.test2(), 0, 0);
		this.page.redraw();
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
	composite = 'source-over';

	get color() { return this.editor.color; }

	getRealOpacity(stepRatio, flow) {
		return getOpacity(Math.round(1 / stepRatio), flow);
	}

	startDraw = evt => {
		this.pts = [];
		const pressure = evt.pointerType === 'mouse' ? 1 : evt.pressure;
		clearSelection();
		if (this.paused) return;

		const { buttons } = evt;
		if (!this.paused && !this.isEraser && [EPenButton.eraser, EPenButton.barrel].includes(buttons)) {
			this.editor.temporaryActivate('eraser', evt);
			return;
		}
		this.layer = this.activeLayer.workingLayer;
		this.layer.composite = this.composite;
		this.layer.opacity = this.opacity;
		this.ctx = this.layer.context;
		this.pixelData = new ImageData(this.layer.width, this.layer.height);

		document.addEventListener('pointermove', this.draw);
		document.addEventListener('pointerup', this.endDraw);
		this.points = [];
		this.lpoint = null;

		const { color } = this;
		const { stepRatio, flow, size, hardness, roundness, rotate } = this;
		const rgba = Object.assign({}, color, { a: this.getRealOpacity(stepRatio, flow) });
		const width = pressure * size;
		const pos = this.viewport.getLayerLocation({ x: evt.pageX, y: evt.pageY });
		Object.assign(pos, {
			color: rgba,
			width,
			hardness,
			roundness,
			rotate
		});
		this.lpoint = pos;
		this.pts.push(pos);
		brush.drawPoint(pos, pos.width, this.pixelData);
		this.ctx.putImageData(this.pixelData, 0, 0);
		this.viewport.redraw();
		this.distance = 0;
		this.iterations = 0;
		this.lock();
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
		const { size, flow, color, hardness, roundness, rotate } = this;
		let { stepRatio } = this;
		const pressure = evt.pointerType === 'mouse' ? 1 : evt.pressure;

		const tilt = { x: evt.tiltX, y: evt.tiltY };
		if (roundness !== undefined) stepRatio *= roundness;
		// const rotate = evt.twist;

		const rgba = Object.assign({}, color, { a: this.getRealOpacity(stepRatio, flow) });
		let width = Math.round(pressure * size * 100) / 100;
		if (width < 0.1) width = 0.1;
		const pos = this.viewport.getLayerLocation({ x: evt.pageX, y: evt.pageY });
		Object.assign(pos, {
			color: rgba,
			width,
			hardness,
			roundness,
			rotate
		});
		if (this.lpoint) {
			const npoint = brush.drawLine(this.lpoint, pos, this.pixelData, stepRatio);
			this.ctx.putImageData(this.pixelData, 0, 0);
			if (npoint) {
				this.lpoint = npoint;
				// this.points.push(npoint);
				this.viewport.redraw();
			} else this.lpoint.width = width;
		} else this.lpoint = pos;
	}

	endDraw = evt => {
		document.removeEventListener('pointermove', this.draw);
		document.removeEventListener('pointerup', this.endDraw);
		this.activeLayer.applyWorking();
		this.finishDraw();
		this.unlock();
	}

	finishDraw() { }

	activate() {
		if (this.isActive) return;
		this.viewport.window.addEventListener('pointerdown', this.startDraw);
		this.page.addEventListener('keydown', this.keyCheck);
		super.activate();
		//this.testBrush();
	}

	deactivate() {
		super.deactivate();
		this.viewport.window.removeEventListener('pointerdown', this.startDraw);
		this.page.removeEventListener('keydown', this.keyCheck);
	}

	freeze() {
		this.page.removeEventListener('keydown', this.keyCheck);
	}

	unfreeze() {
		this.page.addEventListener('keydown', this.keyCheck);
	}

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


	getOptionsControl() {
		return BrushOptions;
	}

	getCursor() {
		if (!this._cursor) {
			this._cursor = new Cursor();
		}
		this.refreshCursor();
		return this._cursor;
	}

	refreshCursor() {
		const sz = this.size * this.page.zoom;
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
		this.trigger('change');
	}

	setBrushHardness(hardness) {
		if (hardness < 0) hardness = 0;
		if (hardness > 1) hardness = 1;
		this.hardness = hardness;
		this.trigger('change');
	}

	setBrushFlow(flow) {
		if (flow < 0) flow = 0;
		if (flow > 1) flow = 1;
		this.flow = flow;
		this.trigger('change');
	}

	setBrushOpacity(opacity) {
		if (opacity < 0) opacity = 0;
		if (opacity > 1) opacity = 1;
		this.opacity = opacity;
		this.trigger('change');
	}

	render() {
		return template.call(this);
	}
}