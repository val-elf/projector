import { Component, createRef } from 'react';
import { func, object } from 'prop-types';

import template from './picture-editor.template.rt';
import './picture-editor.component.less';
import { PictureDocument } from './document/document';
import { IEditor } from './models/editor.model';
import { ColorSelector, LayersManager, Panoramer, Picker, Eraser, Brush, Move } from './tools';
import { Page } from './page/page.component';
import { CommonTool, CommonToolState } from './tools/common-tool.component';
import { PictureEditorStorage } from './store/store';
// import { observer } from '~/services/state-management';

const storage = new PictureEditorStorage();

/*
	Almost done:
		brush, eraser, layers, color picker, zoom, panorame, move (only for layers)
		settings:
		brush: size, hardness, opacity, flow, rotate, roundness
		erase: size, hardness, opacity, flow, rotate, roundness
	TODO:
		tools:
			tool cursors
			text tool
			selection - ?, text, move for selection,
			blur tool (may be smooth/finger etc)
			stamp (clone) tool
			transform (layers and selection), fit canvas to window,
			layers: mask layer, special layers (for masking source viewport)
			insert file, upload picture, link with document
			full screen,
			navigator
		settings:
			brush: roundness, angle
			eraser: roundness, angle
			text: font, size
			actions: save, resize canvas, rotate canvas
*/
export class PictureEditor extends Component<any> implements IEditor {
	static contextTypes = {
		t: func.isRequired
	};

	static childContextTypes = {
		editor: object.isRequired
	};

	pageRef = createRef();
	get page() { return this.pageRef.current as Page; }
	moveRef = createRef();
	get moveTool() { return this.moveRef.current as Move; }
	brushRef = createRef();
	get brushTool() { return this.brushRef.current as Brush; }
	eraserRef = createRef();
	get eraserTool() { return this.eraserRef.current as Eraser; }
	pickerRef = createRef();
	get pickerTool() { return this.pickerRef.current as Picker<{ onChange: Function}>; }
	panoramerRef = createRef();
	get panoramerTool() { return this.panoramerRef.current as Panoramer; }
	layersManagerRef = createRef();
	get layersManager() { return this.layersManagerRef.current as LayersManager; }
	colorSelectorRef = createRef();
	get colorSelector() { return this.colorSelectorRef.current as ColorSelector; }
	get activeLayer() { return this.document.activeLayer; }

	get activeTool() { return storage.state.toolClass; }


	componentDidMount() {
		storage.subscribe('@zoom', () => {
			if (this.selected) this.selected.refreshCursor();
		});
	}

	document = new PictureDocument(3900, 2400);

	toolMap = {
		move: 'moveTool',
		brush: 'brushTool',
		eraser: 'eraserTool',
		picker: 'pickerTool',
		panoramer: 'panoramerTool'
	};

	selected: CommonTool<any, any>;
	currentTool: CommonTool<any, any>;

	getChildContext() {
		return { editor: this };
	}

	temporaryActivate(toolName, ...args) {
		// if (this.selected && this.selected.locked) return;

		if (this.currentTool) {
			this.selected && this.selected.deactivate();
		} else {
			this.currentTool = this.selected;
			// this.selected && this.selected.pause();
		}
		const tool = this[this.toolMap[toolName]];
		if (tool) {
			tool.temporaryActivate(...args);
			this.setState({ cursor: tool.getCursor() });
			if (this.props.onSelectTool) this.props.onSelectTool(tool);
			this.selected = tool;
		}
	}

	activate(toolName) {
		const tool = this[this.toolMap[toolName]];
		try {
			if (tool) tool.setActive();
		} catch (error) {
			console.error('We cannot activate tool', toolName, error);
		}
	}

	deactivateTemporary() {
		if (!this.currentTool) return;
		this.selected.deactivate();
		this.selected = this.currentTool;
		// this.selected && this.selected.restore();
		if (this.props.onSelectTool) this.props.onSelectTool(this.selected);
		this.currentTool = null;
	}

	getImage() {
		return this.document.preview;
	}

	selectTool(tool) {
		if (this.selected) this.selected.release();
		this.selected = tool;
		this.setState({ cursor: tool.getCursor() });
		if (this.props.onSelectTool) this.props.onSelectTool(tool);
	}

	render() {
		return template.call(this);
	}

}