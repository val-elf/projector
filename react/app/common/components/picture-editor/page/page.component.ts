import * as React from 'react';
import { Component, createRef } from 'react';
import ResizeObserver from "resize-observer-polyfill";
import { Layer } from '../document/layer';
import { Viewport } from '../document/viewport';
import template from './page.template.rt';
import './page.component.less';
import * as PropTypes from 'prop-types';
import { PictureDocument } from '../document/document';
import { ICoordinates } from 'controls/picture-editor/models/editor.model';
import { storage } from '../store/store';

export class Page extends Component {

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
		height: 600,
		document: undefined,
		cursor: undefined
	}

	storage = storage;

	context: any;

	zoomMul = 1.25;
	viewport: Viewport;
	resizeObserver: ResizeObserver;
	ctx: CanvasRenderingContext2D;
	cursorCanvas: HTMLCanvasElement;
	altPressed: boolean;
	ctrlPressed: boolean;
	spacePressed: boolean;
	cursorPos: { x: number, y: number };

    rootRef = createRef();
    get root(): HTMLElement { return this.rootRef.current as HTMLElement; }

	viewportRef = createRef();
    get viewportNode(): HTMLElement { return this.viewportRef.current as HTMLElement; }

	get width() { return this.state.width; }
	get height() { return this.state.height; }
	get document(): PictureDocument { return this.state.document; }
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
			this.state.document.on('update', () => this.redraw());
		}
		if (pstate.cursor !== cursor) {
			cursor.onChangeCursor(() => this.cursorMove());
		}
	}

    componentDidMount() {
		const { document: doc} = this;
		this.viewport = new Viewport(doc, this.viewportNode);
		this.viewportNode.appendChild(this.viewport.canvas);
		storage.setViewport(this.viewport);

		this.resizeObserver = new ResizeObserver(evt => {
            this.checkDimenstions(evt);
		});
		this.resizeObserver.observe(this.root.parentNode as Element);

		this.cursorCanvas = document.createElement('canvas');
		this.ctx = this.cursorCanvas.getContext('2d');
		this.cursorCanvas.className = 'picture-editor_cursor';
		this.viewportNode.appendChild(this.cursorCanvas);

		this.viewport.canvas.addEventListener('contextmenu', this.preventContext);
		this.addEventListener('keydown', this.keyCheck);
		this.addEventListener('keyup', this.keyRelease);
		this.viewport.canvas.addEventListener('pointermove', this.cursorMove);
		this.viewport.window.addEventListener('wheel', this.setZoom);
	}

	componentWillUnmount() {
		this.resizeObserver.unobserve(this.root.parentNode as Element);
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
					this.resetZoom();
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

	resetZoom() {
		this.storage.setViewpoint({ x: 0, y: 0 }, 1);
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
		this.storage.setViewpoint(pos, zm);
		//this.viewport.setZoom(zm, pos);
	}

	getAbsLocation(ax, ay): ICoordinates {
		const bound = this.viewport.window.getBoundingClientRect() as DOMRect;
		const { x, y } = bound;
		return { x: ax - Math.round(x), y: ay - Math.round(y) };
	}

	getLocation(ax, ay) {
		const { x, y } = this.viewport.bounding as DOMRect;
		const dx = this.pan.x < 0 ? 0 : this.pan.x;
		const dy = this.pan.y < 0 ? 0 : this.pan.y;
		const ox = ax - x - dx, oy = ay - y - dy;
		const { rx, ry } = { rx: ox / this.zoom, ry: oy / this.zoom };
		return { x: rx, y: ry };
	}

    checkDimenstions(evt) {
        const parent = this.root.parentNode as HTMLElement;
		const { width, height } = parent.getBoundingClientRect();
        Object.assign(this.root.style, {
            width: `${width}px`,
            height: `${height}px`
		});
		this.viewport.resize(width, height);
	}

	cursorMove = (evt?) => {
		const { cursor } = this;
		if (cursor) {
			const boundary = this.viewport.bounding as DOMRect;
			if (evt) {
				const { pageX: x, pageY: y } = evt;
				this.cursorPos = { x, y };
			}
			if (this.cursorPos) {
				const { x, y } = this.cursorPos;
				const { dx, dy } = { dx: x - boundary.x - cursor.left, dy: y - boundary.y - cursor.top};
				const { width, height } = cursor.canvas;
				this.ctx.clearRect(0, 0, boundary.width, boundary.height);
				this.ctx.drawImage(cursor.canvas, 0, 0, width, height, dx, dy, width, height);
			}
		}
	}

	mergeLayers() {
		// context.canvas - is a base canvas for workbanch
		this.viewport.redraw();
	}

	mergeToActive(layer) {
		this.activeLayer.mergeWith(layer);
		layer.clean();
		this.redraw();
	}

    generateWorkingLayer() {
		const { width, height } = this.viewport;
		const layer = new Layer({ width, height, name: '', id: Layer.generateId() }, this.document);
		this.virtuals.push(layer);
        return layer;
    }

    removeWorkingLayer(layer) {
		const cindex = this.virtuals.indexOf(layer);
		if (cindex > -1) this.virtuals.splice(cindex, 1);
	}

	redraw() {
		this.mergeLayers();
	}

    render() {
		return template.call(this);
    }
}
