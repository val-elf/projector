import { Component } from 'react';
import { object } from 'prop-types';
import template from './layers-manager.template.rt';

export class LayersManager extends Component {
	static contextTypes = {
		editor: object.isRequired
	}

	state = {
		active: false
	};

	get editor() { return this.context.editor; }

	toggleActive() {
		const { active } = this.state;
		this.setState({ active: !active });
	}

	render() {
		return template.call(this);
	}
}