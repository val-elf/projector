import React from 'react';
import PropTypes from 'prop-types';
import template from './settings-page.template';
import './settings-page.component.less';

export class SettingsPage extends React.Component {
	static contextTypes = {
		t: PropTypes.func.isRequired
	};

	static getDerivedStateFromProps(props, state) {
		const newState = Object.assign({}, state);
		const { document } = props;
		if (newState.document !== document) {
			newState.document = document;
			const { width, height } = document;
			Object.assign(newState, { width, height });
		}
		return newState;
	}

	state = {
		isResize: true
	};

	setSize(dim, size) {
		const { linked } = this.state;
		const st = { [dim]: size, last: dim };
		if (linked) {
			const cdim = dim === 'width' ? 'height' : 'width';
			const { document: doc } = this.state;
			const proport = doc[cdim] / doc[dim];
			let csize = Math.round(size * proport);
			Object.assign(st, { [cdim]: csize });
		}
		this.setState(st);
	}

	handleChange(dim) {
		return evt => {
			const size = parseInt(evt.target.value, 10);
			this.setSize(dim, size);
		}
	}

	setSquare(square) {
		this.setState({ square });
	}

	async toggleLinkedState() {
		const { linked } = this.state;
		await this.setState({ linked: !linked });
		const { last: dim } = this.state;
		if (dim) {
			const size = this.state[dim];
			this.setSize(dim, size);
		}
	}

	onClose(res) {
		if (res) {
			const { width, height, square } = this.state;
			return {
				width,
				height,
				square
			};
		}
	}

	render() {
		return template.call(this);
	}
}