import * as React from 'react';
import * as PropTypes from 'prop-types';
import template from './picture-editor.template.rt';
import './picture-editor.component.less';
import { PictureDocument } from './document/document';
import { IEditor } from './models/editor.model';
import { ColorSelector, LayersManager, Panoramer, Picker, Eraser, Brush, Move } from './tools';
import { Page } from './page';
import { CommonTool, CommonToolState } from './tools/common-tool.component';

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

export class PictureEditor extends React.Component<any> implements IEditor {
	static contextTypes = {
		t: PropTypes.func.isRequired
	};

	static childContextTypes = {
		editor: PropTypes.object.isRequired
	};

	static getDerivedStateFromProps(props, state) {
		const newState = Object.assign({}, state);
		return newState;
	}

	state = {
		colorPickerShowed: false
	};

	pageRef = React.createRef();
	get page() { return this.pageRef.current as Page; }
	moveRef = React.createRef();
	get moveTool() { return this.moveRef.current as Move; }
	brushRef = React.createRef();
	get brushTool() { return this.brushRef.current as Brush; }
	eraserRef = React.createRef();
	get eraserTool() { return this.eraserRef.current as Eraser; }
	pickerRef = React.createRef();
	get pickerTool() { return this.pickerRef.current as Picker; }
	panoramerRef = React.createRef();
	get panoramerTool() { return this.panoramerRef.current as Panoramer; }
	layersManagerRef = React.createRef();
	get layersManager() { return this.layersManagerRef.current as LayersManager; }
	colorSelectorRef = React.createRef();
	get colorSelector() { return this.colorSelectorRef.current as ColorSelector; }

	get activeLayer() { return this.document.activeLayer; }

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

	get color() {
		return this.colorSelector ? this.colorSelector.activeColor : null;
	}

	set color(value: string) {
		this.colorSelector.activeColor = value;
	}

	getChildContext() {
		return { editor: this };
	}

	changeActiveColor() {
		this.setState({});
	}

	toggleColorPicker() {
		let { colorPickerShowed } = this.state;
		colorPickerShowed = !colorPickerShowed;
		this.page.focus();
		this.setState({ colorPickerShowed });
	}

	temporaryActivate(toolName, ...args) {
		if (this.selected && this.selected.locked) return;
		if (this.currentTool) {
			this.selected && this.selected.deactivate();
		} else {
			this.currentTool = this.selected;
			this.selected && this.selected.pause();
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
		this.selected && this.selected.restore();
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