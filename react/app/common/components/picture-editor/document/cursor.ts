export class Cursor {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	left: number;
	top: number;
	changeCallback: Function;

	constructor() {
		this.canvas = document.createElement('canvas');
		this.ctx = this.canvas.getContext('2d');
	}

	setSize(width, height) {
		width = width < 1 ? 1 : width;
		height = height < 1 ? 1 : height;
		Object.assign(this.canvas, { width, height });
	}

	setLocation(left, top) {
		this.left = left;
		this.top = top;
	}

	get context() { return this.ctx; }

	onChangeCursor(cb: Function) {
		this.changeCallback = cb;
	}

	toggleChange() {
		this.changeCallback && this.changeCallback();
	}

	getCursorData() {
		const imageData = this.canvas.toDataURL('image/png');
		return `url(${imageData}) ${this.left} ${this.top}, auto`;
	}
}