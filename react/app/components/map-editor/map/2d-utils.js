
function getK(p1, p2) { return p2.x === p1.x ? undefined: (p2.y - p1.y) / (p2.x - p1.x); }

function getB(p, k) {return p.y - k * p.x; }

function getLineInfo(p1, p2) {
	const k = getK(p1, p2);
	const b = getB(p1, k);
	return { k, b };
}

function getCross(p0, p1, p2){
	const k = getK(p1, p2);
	const ks = k === undefined ? 0 : k === 0 ? undefined : -1/k;
	const b = k === undefined ? 0 : getB(p1, k);
	const bs = ks === undefined ? 0 : getB(p0, ks);
	const x = k === undefined ? p1.x
			: k === 0 ? p0.x
			: (bs - b) / (k + 1/k)
	;

	const res = {
		x: x,
		y: k !== undefined ? k * x + b : p0.y
	}
	const r = getDistance2(p1, p2)
	if(getDistance2(p1, res) > r || getDistance2(p2, res) > r) return null;
	return res;
}

function inZone(p, p1, p2, radius){ //returns true, if  p1-p2 in p0 zone
	//check for zone1
	if(p1.x < p.x - radius && p2.x < p.x - radius) return false;
	if(p1.y < p.y - radius && p2.y < p.y - radius) return false;
	if(p1.x > p.x + radius && p2.x > p.x + radius) return false;
	if(p1.y > p.y + radius && p2.y > p.y + radius) return false;
	return true;
}

function getDiagonal(box) {
	const { x, y, width, height } = box;
	return getDistance({ x, y }, { x: x+width, y: y + height });
}

function getDistance2(p1, p2) {
	const dx = p1.x - p2.x;
	const dy = p1.y - p2.y;
	return dx * dx + dy * dy;
}

function getDistance(p1, p2) {
	return Math.sqrt(getDistance2(p1, p2));
}

function getRGB(color) {
	const mtch = color.match(/#(..)(..)(..)/);
	const r = parseInt(mtch[1], 16);
	const g = parseInt(mtch[2], 16);
	const b = parseInt(mtch[3], 16);
	return { r, g, b };
}

function fromRGB(rgb) {
	const { r, g, b } = rgb;
	const hex = function(num) {
		num = num > 255 ? 255 : num;
		let res = num.toString(16).toUpperCase();
		if (res.length === 1) res = "0" + res;
		return res;
	};
	return `#${hex(r)}${hex(g)}${hex(b)}`;
}

function darkenColor(color, value /* value in percents*/) {
	const rgb = getRGB(color);
	const mul = 1 - value / 100;
	let { r, g, b} = rgb;
	return fromRGB({
		r: Math.round(r * mul),
		g: Math.round(g * mul),
		b: Math.round(b * mul)
	});
}

function lightenColor(color, value) {
	const rgb = getRGB(color);
	const mul = 1 + value / 100;
	let { r, g, b} = rgb;
	return fromRGB({
		r: Math.round(r * mul),
		g: Math.round(g * mul),
		b: Math.round(b * mul)
	});
}

export default {
	getDistance,
	getDiagonal,
	getCross,
	getLineInfo,
	inZone,
	darkenColor,
	lightenColor
};
