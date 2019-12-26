import { Component } from 'react';
import { func } from 'prop-types';
import template from './settings-page.template.rt';
import './settings-page.component.less';
import { PictureDocument } from 'controls/picture-editor/document/document';

interface SettingsPageProps {
	document: PictureDocument
}

enum dimension {
	width = 'width',
	height = 'height'
};
type doption = { [key in dimension]: number };

interface SettingsPageState {
	isResize: boolean;
	linked: boolean;
	last?: dimension;
	document?: PictureDocument;
	width?: number;
	height?: number;
	square?: boolean;
}

export class SettingsPage<P extends SettingsPageProps, S extends SettingsPageState> extends Component<P, S> {
	static contextTypes = {
		t: func.isRequired
	};

	static getDerivedStateFromProps(props: SettingsPageProps, state: SettingsPageState) {
		const newState = { ...state };
		const { document } = props;
		if (newState.document !== document) {
			newState.document = document;
			const { width, height } = document;
			Object.assign(newState, { width, height });
		}
		return newState;
	}

	state: S = {
		isResize: true,
		linked: false
	} as S;

	setSize(dim: dimension, size: number) {
		const { linked } = this.state;
		const st: doption = { [dim]: size } as doption;
		if (linked) {
			const cdim = dim === dimension.width ? dimension.height : dimension.width;
			const { document: doc } = this.state;
			const proportion = doc[cdim] / doc[dim];
			let csize = Math.round(size * proportion);
			Object.assign(st, { [cdim]: csize });
		}
		this.setState({ ...st, last: dim });
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