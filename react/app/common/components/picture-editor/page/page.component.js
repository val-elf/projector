import React from 'react';
import ResizeObserver from "resize-observer-polyfill";
import { Layer } from '../document/layer';
import { Viewport } from '../document/viewport';
import template from './page.template';
import './page.component.less';
import PropTypes from 'prop-types';

export class Page extends React.Component {

	static contextTypes = {
		editor: PropTypes.object.isRequired
	}

    static getDerivedStateFromProps(props, state) {
		const newState = Object.assign({}, state);
		const { document, cursor } = props;
		if (document && newState.document !== document) newState.document = document;
		if (cursor && newState.cursor !== cursor) newState.cursor = cursor;
        return newState;
	}

    state = {
        width: 800,
		height: 600
    }

	zoomMul = 1.25;

    rootRef = React.createRef();
    get root() { return this.rootRef.current; }

	viewportRef = React.createRef();
    get viewportNode() { return this.viewportRef.current; }

	get width() { return this.state.width; }
	get height() { return this.state.height; }
	get document() { return this.state.document; }
	get cursor() { return this.state.cursor; }

	get layers() { return this.document.layers; }
	get editor() { return this.context.editor; }

	virtuals = [];

	get activeLayer() { return this.editor.activeLayer; }

	get zoom() { return this.document.viewport.zoom; }
	get pan() { return this.document.viewport.pan; }

	componentDidUpdate(pprop, pstate) {
		const { cursor } = this.state;
		if (pstate.document !== this.state.document) {
			state.document.on('update', () => this.redraw());
		}
		if (pstate.cursor !== cursor) {
			cursor.onChangeCursor(() => this.cursorMove());
		}
	}

    componentDidMount() {
		const { document: doc} = this;

		this.viewport = new Viewport(doc, this.viewportNode);

		doc.on('update', () => this.redraw());
		this.viewportNode.appendChild(this.viewport.canvas);
		this.ctx = this.viewport.context;

		this.resizeObserver = new ResizeObserver(evt => {
            this.checkDimenstions(evt);
		});
		this.resizeObserver.observe(this.root.parentNode);

		this.cursorCanvas = document.createElement('canvas');
		this.cctx = this.cursorCanvas.getContext('2d');
		this.cursorCanvas.className = 'picture-editor_cursor';
		this.viewportNode.appendChild(this.cursorCanvas);

		this.viewport.canvas.addEventListener('contextmenu', this.preventContext);
		this.addEventListener('keydown', this.keyCheck);
		this.addEventListener('keyup', this.keyRelease);
		this.viewport.canvas.addEventListener('pointermove', this.cursorMove);
		this.viewport.window.addEventListener('wheel', this.setZoom);

		this.watermark = this.root.querySelector('.image-page_watermark');
		Object.assign(this.watermark.style, {
			width: `${doc.width}px`,
			height: `${doc.height}px`
		});
	}

	freshWatermark() {
		const { document: doc } = this;
		const { viewport } = doc;
		const left = this.pan.x < 0 ? 0 : this.pan.x;
		const top = this.pan.y < 0 ? 0 : this.pan.y;
		let width = doc.width * this.zoom;
		let height = doc.height * this.zoom;
		if (width > viewport.width) width = viewport.width;
		if (height > viewport.height) height = viewport.height;
		Object.assign(this.watermark.style, {
			width: `${width}px`,
			height: `${height}px`,
			left: `${left}px`,
			top: `${top}px`
		});
	}

	componentWillUnmount() {
		this.resizeObserver.unobserve(this.root.parentNode);
		this.removeEventListener('keydown',this.keyCheck);
		this.removeEventListener('keyup', this.keyRelease);
		this.viewport.canvas.removeEventListener('contextmenu', this.preventContext);
		this.viewport.canvas.removeEventListener('pointermove', this.cursorMove);
		this.viewport.canvas.removeEventListener('wheel', this.setZoom);
	}

	addEventListener(event, cb) {
		document.addEventListener(event, cb);
	}

	removeEventListener(event, cb) {
		document.removeEventListener(event, cb);
	}

	preventContext = evt => evt.preventDefault();

	keyCheck = evt => {
		// console.log('evt', evt);
		switch(evt.key) {
			case 'Alt':
				if (!this.altPressed) {
					this.altPressed = true;
					evt.preventDefault();
					this.context.editor.temporaryActivate('picker');
				}
			break;
		}
		switch(evt.code) {
			case 'ControlLeft':
				if (!this.ctrlPressed) {
					this.ctrlPressed = true;
					evt.preventDefault();
					this.context.editor.temporaryActivate('move');
				}
			break;
			case 'NumpadAdd':
				if (evt.ctrlKey) {
					evt.preventDefault();
					this.zoomIn({ x: this.document.width / 2, y: this.document.height / 2 });
				}
			break;
			case 'NumpadSubtract':
				if (evt.ctrlKey) {
					evt.preventDefault();
					this.zoomOut({ x: this.document.width / 2, y: this.document.height / 2 });
				}
			break;
			case 'Digit0':
				if (evt.ctrlKey) {
					evt.preventDefault();
					this.actualZoom();
				}
			break;
			case 'Space':
				if (!this.spacePressed && !this.altPressed) {
					this.spacePressed = true;
					evt.preventDefault();
					this.context.editor.temporaryActivate('panoramer');
				}
			break;
			case 'KeyB':
				this.context.editor.activate('brush');
			break;
			case 'KeyE':
				this.context.editor.activate('eraser');
			break;
		}
	}

	keyRelease = evt => {
		switch(evt.key) {
			case 'Alt':
				this.altPressed = false;
				this.context.editor.deactivateTemporary();
			break;
			case 'Delete':
				this.activeLayer && this.activeLayer.clean();
				this.redraw();
			break;
		}
		switch(evt.code) {
			case 'ControlLeft':
				this.ctrlPressed = false;
				this.context.editor.deactivateTemporary();
			break;
			case 'Space':
				this.spacePressed = false;
				this.context.editor.deactivateTemporary();
			break;
		}
	}

	focus() {
		this.root.focus();
	}

	actualZoom() {
		Object.assign(this.viewport.pan, { x: 0, y: 0 });
		this.viewport.zoom = 1;
	}

	setZoom = evt => {
		const pos = this.getAbsLocation(evt.pageX, evt.pageY);
		const dir = evt.wheelDeltaY > 0;
		if (dir) this.zoomIn(pos); else this.zoomOut(pos);
	}

	zoomIn(pos) {
		this.zoomBy(pos, this.zoomMul);
	}

	zoomOut(pos) {
		this.zoomBy(pos, 1 / this.zoomMul);
	}

	zoomBy(pos, zm) {
		const { x, y } = pos;
		this.pan.x = x  * (1 - zm) + this.pan.x * zm;
		this.pan.y = y * (1 - zm) + this.pan.y * zm;
		this.editor.selected && this.editor.selected.refreshCursor();
		this.viewport.zoom *= zm;
	}

	getAbsLocation(ax, ay) {
		const { x, y } = this.viewport.bounding;
		return { x: ax - x, y: ay - y };
	}

	getLocation(ax, ay) {
		const { x, y } = this.viewport.bounding;
		const dx = this.pan.x < 0 ? 0 : this.pan.x;
		const dy = this.pan.y < 0 ? 0 : this.pan.y;
		const ox = ax - x - dx, oy = ay - y - dy;
		const { rx, ry } = { rx: ox / this.zoom, ry: oy / this.zoom };
		return { x: rx, y: ry };
	}

    checkDimenstions(evt) {
        const parent = this.root.parentNode;
		const { width, height } = parent.getBoundingClientRect();
        Object.assign(this.root.style, {
            width: `${width}px`,
            height: `${height}px`
		});
		this.viewport.resize(width, height);
	}

	cursorMove = evt => {
		const { cursor } = this;
		if (cursor) {
			const boundary = this.viewport.bounding;
			if (evt) {
				const { pageX: x, pageY: y } = evt;
				this.cursorPos = { x, y };
			}
			if (this.cursorPos) {
				const { x, y } = this.cursorPos;
				const { dx, dy } = { dx: x - boundary.x - cursor.left, dy: y - boundary.y - cursor.top};
				const { width, height } = cursor.canvas;
				this.cctx.clearRect(0, 0, boundary.width, boundary.height);
				this.cctx.drawImage(cursor.canvas, 0, 0, width, height, dx, dy, width, height);
			}
		}
	}

	mergeLayers() {
		// context.canvas - is a base canvas for workbanch
		const { view } = this.document.getView();
		this.viewport.putImage(view);
	}

	mergeToActive(layer) {
		this.activeLayer.mergeWith(layer);
		layer.clean();
		this.redraw();
	}

    generateWorkingLayer() {
		const { width, height } = this.viewport;
		const layer = new Layer({ width, height, working: true }, this);
		this.virtuals.push(layer);
        return layer;
    }

    removeWorkingLayer(layer) {
		const cindex = this.virtuals.indexOf(layer);
		if (cindex > -1) this.virtuals.splice(cindex, 1);
	}

	hideViewport() {
		this.viewport.style.display = 'none';
	}

	showViewport() {
		this.viewport.style.removeProperty('display');
	}

	redraw() {
		//this.ctx.clearRect(0, 0, this.viewport.width, this.viewport.height);
		this.mergeLayers();
		this.freshWatermark();
	}

    render() {
        return template.call(this);
    }
}