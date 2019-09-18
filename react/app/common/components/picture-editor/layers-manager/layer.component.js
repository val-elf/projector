import React from 'react';
import PropTypes from 'prop-types';
import template from './layer.template';

const pwidth = 75;

export class Layer extends React.Component {

	static contextTypes = {
		editor: PropTypes.object.isRequired
	};

	static getDerivedStateFromProps(props, state) {
		const newState = Object.assign({}, props);
		const { layer } = props;
		if (newState.layer !== layer) newState.layer = layer;
		return newState;
	}

	get editor() { return this.context.editor; }
	get page() { return this.editor.page; }

	state = {};

	canvasRef = React.createRef();
	get canvas() { return this.canvasRef.current; }
	get layer() { return this.state.layer; }
	get name() { return this.layer.name; }
	get active() { return this.layer.active; }

	componentDidMount() {
		this.ctx = this.canvas.getContext('2d');
		this.layer.on('update', this.updateLayer);
		this.layer.on('apply', this.updateLayer);
		this.updateLayer();
	}

	componentWillUnmount() {
		this.layer.off('update', this.updateLayer);
		this.layer.off('apply', this.updateLayer);
	}

	updateLayer = () => {
		const { width: swidth, height: sheight } = this.layer;
		let height = pwidth / swidth * sheight;
		this.canvas.width = pwidth;
		this.canvas.height = height;
		debugger;
		this.ctx.drawImage(this.layer.canvas, 0, 0, swidth, sheight, 0, 0, pwidth, height);
	}

	toggleVisible(evt) {
		evt.stopPropagation();
		const { isVisible } = this.layer;
		this.layer.isVisible = !isVisible;
		this.page.redraw();
		this.setState({});
	}

	select() {
		this.layer.active = true;
	}

	render() {
		return template.call(this);
	}
}