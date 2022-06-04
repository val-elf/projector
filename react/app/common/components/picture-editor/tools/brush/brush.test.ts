import { Brush } from "./brush.component";
import { BrushManager } from '../brush-utils';
import { testPoints } from './points.test';

const brush = new BrushManager();

function test1() {
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

function test2() {
	const red = { r: 255, g: 0, b: 0, a: 1 };
	const rdata = new ImageData(800, 500);
	const hardness = 0.01;
	const frame = 180;
	const shift = 0;

	let c = 0;
	for (var i = frame * 30 + shift; i < frame * 30 + 1 + shift; i ++) {
		const r = i * 0.01;
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
