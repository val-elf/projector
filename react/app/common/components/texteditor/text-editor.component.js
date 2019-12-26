import React from 'react';
import PropTypes from 'prop-types';
import tinymce from 'tinymce';
import { ModalService } from 'controls/materials';
import { TextEditorPanel } from './text-editor-panel.component';
import template from './text-editor.template';

const FontNames = {
	arialFont: {inline: 'span', styles: {fontFamily : 'Arial'}, title: 'Arial'},
	calibriFont: {inline: 'span',styles: {fontFamily : 'Calibri'}, title: 'Calibri'},
	comicFont: {inline: 'span', styles: {fontFamily : 'Comic Sans Ms'}, title: 'Comic Sans'},
	tahomaFont: {inline: 'span', styles: {fontFamily : 'Tahoma'}, title: 'Tahoma'},
	verdanaFont: {inline: 'span', styles: {fontFamily : 'Verdana'}, title: 'Verdana'},
	timesFont: {inline: 'span', styles: {fontFamily : 'Times New Roman'}, title: 'Times New Roman'}
};

const TextStyles = {
	heading1style: {format:'h1', title: 'Heading 1'},
	heading2style: {format:'h2', title: 'Heading 2'},
	heading3style: {format:'h3', title: 'Heading 3'},
	heading4style: {format:'h4', title: 'Heading 4'},
	heading5style: {format:'h5', title: 'Heading 5'},
	heading6style: {format:'h6', title: 'Heading 6'},
	paragraph6style: {format: 'p', title: 'Paragraph'}
};

const FontSizes = {
	'size8px': {inline: 'span', styles: {fontSize : '8px'}, title: '8px'},
	'size9px': {inline: 'span', styles: {fontSize : '9px'}, title: '9px'},
	'size10px': {inline: 'span', styles: {fontSize : '10px'}, title: '10px'},
	'size11px': {inline: 'span', styles: {fontSize : '11px'}, title: '11px'},
	'size12px': {inline: 'span', styles: {fontSize : '12px'}, title: '12px'},
	'size14px': {inline: 'span', styles: {fontSize : '14px'}, title: '14px'},
	'size16px': {inline: 'span', styles: {fontSize : '16px'}, title: '16px'},
	'size18px': {inline: 'span', styles: {fontSize : '18px'}, title: '18px'},
	'size20px': {inline: 'span', styles: {fontSize : '20px'}, title: '20px'},
	'size24px': {inline: 'span', styles: {fontSize : '24px'}, title: '24px'},
	'size28px': {inline: 'span', styles: {fontSize : '28px'}, title: '28px'},
	'size32px': {inline: 'span', styles: {fontSize : '32px'}, title: '32px'},
	'size40px': {inline: 'span', styles: {fontSize : '40px'}, title: '40px'},
	'size64px': {inline: 'span', styles: {fontSize : '64px'}, title: '64px'},
	'size72px': {inline: 'span', styles: {fontSize : '72px'}, title: '72px'}
};

function getActualFormat(fmts){
	var max = null;
	Object.keys(fmts).forEach(fmt => {
		if(!max || fmts[fmt] > fmts[max]) max = fmt;
	});
	return max;
}

export class TextEditor extends React.Component {

	static contextTypes = {
		t: PropTypes.func.isRequired
	}

	textStyles = TextStyles;
	fontSizes = FontSizes;
	fontNames = FontNames;

	styles = {};
	tstyles = {};
	fonts = {};
	sizes = {};

	height = this.props.height;
	minHeight = this.props.minHeight;
	maxHeight = this.props.maxHeight;
	rows = this.props.rows;
	state = {
		textStyle: '',
		fontName: '',
		fontSize: '',
		fontOpen: false,
	};

	options = {
		hasLink: false,
		hasPicture: false
	};

	toolPanelRef = React.createRef();
	rootRef = React.createRef();

	get toolPanel() {
		return this.toolPanelRef.current;
	}

	get root() { return this.rootRef.current; }

	static getDerivedStateFromProps(props, state) {
		const newState = Object.assign({}, state);
		const { value } = props;

		if (newState.initValue != value) {
			Object.assign(newState, {
				value,
				initValue: value
			});
		}
		if (props.children) {
			const children = props.children.length ? props.children : [props.children];
			newState.panel = children.filter(child => child.type === TextEditorPanel);
		}
		return newState;
	}

	do(what, isApply) {
		if(this.editor && this.editor.formatter.canApply(what)) {
			this.editor.formatter[isApply ? 'apply':'toggle'](what);
			this.editor.fire('ChangeFormat', {});
		}
	}

	doCommand(what) {
		if(this.editor){
			this.editor.execCommand(what);
		}

	}

	handleChanges(type) {
		const stateName = {
			font: 'fontName',
			'style': 'textStyle',
			'size': 'fontSize'
		}[type];

		return (event, ...rest) => {
			let value = event.target.value;
			this[`${type}Change`](value);
			this.setState({
				[stateName]: value
			}, () => {
				this.editorNode.focus({
					preventScroll: true
				});
			});
		}
	}

	focusOpen() {
		this.setState({
			fontOpen: true
		});
	}

	prepareChangedValue(value) {
		if (!value || value === 'default') return undefined;
		return value;
	}

	fontChange(value) {
		value = this.prepareChangedValue(value);
		var apply = true;
		if(value === undefined){
			value = getActualFormat(this.fonts);
			apply = false;
		}
		this.do(value, apply);
	}

	styleChange(value) {
		this.do(value, true);
	}

	sizeChange(value) {
		value = this.prepareChangedValue(value);
		var apply = true;
		if(value === undefined){
			apply = false;
			value = getActualFormat(this.sizes);
		}
		this.do(value, apply);
	}

	componentDidMount() {
		tinymce.init({
			inline: true,
			skin: false,
			statusbar: false,
			toolbar: false,
			menubar: false,
			formats: Object.assign({}, FontNames, FontSizes)
		});

		Object.assign(this.options, this.props.options || {});

		const id = Math.random().toString().replace('0.', '');

		this.editorNode = this.root.querySelector(".text-editor");
		this.editorNode.id = id;
		setTimeout(() => {
			tinymce.execCommand('mceAddEditor', false, id);
			let editor = tinymce.get(id);
			if(!editor) return;
			this.editor = editor;

			const tstyles = Object.keys(TextStyles).map(function(ts){return TextStyles[ts].format});
			const fontsChangeds = Object.keys(Object.assign({}, FontNames, FontSizes)).concat(tstyles).join(',');
			const changeHandler = (event) => {
				var ec = this.editor.getContent();
				this.props.onChange && this.props.onChange(ec);
			};

			this.editor.formatter.formatChanged(
				"bold,italic,underline,alignleft,alignright,aligncenter,alignjustify," + fontsChangeds,
				(isOn, format) => this.formatChanged(isOn, format),
				false
			);
			this.editor
				.on('Change', changeHandler)
				.on('KeyPress', changeHandler)
				.on('Paste', changeHandler)
				.on('Cut', changeHandler)
				.on('ExecCommand', changeHandler)
				.on('ChangeFormat', changeHandler)
			;
			this.updateEditorState();
		});
	}

	insertLink() {
		try {
			const link = ModalService.open(this.options.linkSelector, {
				title: 'Please, select the link',
				content: {}
			});
		} finally { }
	}

	insertPicture() {

	}

	formatChanged(isOn, format) {
		const fn = format.format;
		let fontName = '', fontSize = '', textStyle = '';
		this.styles[fn] = isOn;

		function isFormat(fn){
			return Object.keys(TextStyles).some(function(ts){
				return TextStyles[ts].format === fn;
			});
		}

		if(fn.match(/Font$/)) {
			if(isOn) this.fonts[fn] = format.parents.length;
			else delete this.fonts[fn];
			fontName = getActualFormat(this.fonts);
		}
		if(fn.match(/px$/)) {
			if(isOn) this.sizes[fn] = format.parents.length;
			else delete this.sizes[fn];
			fontSize = getActualFormat(this.sizes);
		}
		if(isFormat(fn)) {
			if(isOn) this.tstyles[fn] = format.parents.length;
			else delete this.tstyles[fn];
			textStyle = getActualFormat(this.tstyles);
		}

		const origin = {
			fontName,
			fontSize,
			textStyle
		};

		const newstate = Object.keys(origin).reduce((res, key) => {
			if(origin[key] !== undefined) res[key] = origin[key] || 'default';
			return res;
		}, {});

		this.setState(newstate);

	}

	componentDidUpdate(pprops, pstate) {
		if (pstate.value !== this.state.value) {
			this.editor && this.editor.setContent(this.state.value || '');
		}
	}

	updateEditorState(){
		if (this.editor) {
			if (this.props.value) {
				this.editor.setContent(this.props.value);
			}
		}
	}

	getStyle(style) {
		return this.textStyles[style].title;
	}

	render() {
		return template.call(this);
	}
}
