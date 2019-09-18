import React from "react";
import PropTypes from 'prop-types';
import template from "./text-edited.template";
import './text-edited.component.less';

export class TextEdited extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	static getDerivedStateFromProps(props, state) {
		const { value } = props;
		if (state.initValue !== value) {
			const mod = {
				value,
				initValue: value,
				type: 'text'
			};
			return Object.assign({}, state, mod);
		}
		return state;
	}

	_displayer = React.createRef();
	get displayer() { return this._displayer.current; }
	_textField = React.createRef();
	get textField() { return this._textField.current; }

	editMode() {
		if (this.props.locked) return;
		var stl = getComputedStyle(this.displayer);
		var fontSize = stl.fontSize;
		var fontFamily = stl.fontFamily;

		this.setState({
			edited: true
		}, () => {
			if (!this.textField) return;
			this.textField.focus();
			this.textField.select();
			Object.assign(this.textField.style, {
				fontSize,
				fontFamily
			});
		});
	}

	checkKey(event) {
		if (event.charCode === 13) {
			this.updateChange();
		}
	}

	updateChange() {
		if (!this.state.value) return;
		const { value } = this.state;
		this.setState({
			edited: false,
		}, () => {
			this.props.onChange && this.props.onChange(value.trim(), true);
			this.props.onChangeComplete && this.props.onChangeComplete(value.trim());
		});
	}

	changeValue() {
		return (event) => {
			const value = event.target.value;
			this.setState({
				editValue: value,
				value: value
			}, () => {
				if (this.props.onChange) {
					this.props.onChange(value.trim());
				}
			});
		};
	}

	componentDidUpdate() {
	}

	render() {
		return template.call(this);
	}
}

TextEdited.contextTypes = {
	t: PropTypes.func.isRequired
}