import React from 'react';
import PropTypes from 'prop-types';
import template from './layers-manager.template';

export class LayersManager extends React.Component {
	static contextTypes = {
		editor: PropTypes.object.isRequired
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