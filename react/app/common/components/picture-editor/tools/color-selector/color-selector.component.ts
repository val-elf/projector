import * as React from 'react';
import * as PropTypes from 'prop-types';
import { RGB2hex } from 'common/colors';
import template from './color-selector.template.rt';
import './color-selector.component.less';

export class ColorSelector extends React.Component {

	static contextTypes = {
		editor: PropTypes.object.isRequired
	}

	state = {
		active: 'fore',
		foreColor: { r: 255, g: 0, b: 0 },
		backColor: { r: 0, g: 0, b: 0}
	};

	get editor() { return this.context.editor; }
	get color() { return RGB2hex(this.state.foreColor); }
	get bgcolor() { return RGB2hex(this.state.backColor); }

	get activeColor(): string {
		const { active } = this.state;
		return this.state[`${active}Color`];
	}

	set activeColor(value) {
		const { active } = this.state;
		this.setState({
			[`${active}Color`]: value
		});
	}

	async toggleColorPicker(type) {
		if (this.state.active !== type) {
			await this.setState({ active: type });
			this.editor.changeActiveColor();
		}
		else this.editor.toggleColorPicker();
	}

	render() {
		return template.call(this);
	}
}