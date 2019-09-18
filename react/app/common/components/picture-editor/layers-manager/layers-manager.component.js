import React from 'react';
import PropTypes from 'prop-types';
import { Layer } from '../document/layer';
import template from './layers-manager.template.rt';
import './layers-manager.component.less';

export class LayersManager extends React.Component {
	static contextTypes = {
		editor: PropTypes.object.isRequired,
		t: PropTypes.func.isRequired
	}

	static getDerivedStateFromProps(props, state) {
		const newState = Object.assign({}, state);
		const { showed, document } = props;
		if (newState.showed !== showed) newState.showed = showed;
		if (newState.document !== document) newState.document = document;
		return newState;
	}

	state = {};

	overlays = [
		'normal',
		'darken',
		'multiply',
		'color burn',
		'lighten',
		'screen',
		'color dodge',
		'lighter color',
		'overlay',
		'soft light',
		'hard light',
		'difference',
		'exclusion',
		'hue',
		'saturation',
		'color',
		'luminosity'
	];

	removeLayerRef = React.createRef();
	get removeLayerAction() { return this.removeLayerRef.current; }

	get document() {
		return this.state.document;
	}
	get layers() {
		return this.document.layers;
	}

	get editor() { return this.context.editor; }

	get page() { return this.editor.page; }

	get orderedLayers() {
		return [...this.layers].reverse();
	}

	componentDidMount() {
		this.document.on('changeActiveLayer', this.changeActiveLayer);
	}

	componentDidUpdate(pprops, pstate) {
		const { showed } = this.state;
		if (showed && pstate.showed !== showed) {
			this.setState({ actions: [this.removeLayerAction] });
		}
	}

	changeActiveLayer = active => {
		this.setState({ active });
	}

	changeLayersOrder = (oldIndex, newIndex) => {
		const { layers } = this;
		if (oldIndex === newIndex) return;
		oldIndex = layers.length - 1 - oldIndex;
		newIndex = layers.length - 1 - newIndex;
		const layer = layers[oldIndex];
		layers.splice(oldIndex, 1);
		layers.splice(newIndex, 0, layer);
		this.editor.page.redraw();
	}

	addNewLayer() {
		const { layers } = this;
		const { active } = this.state;
		let index = layers.length;
		if (active) index = layers.indexOf(active) + 1;
		const newLayer = new Layer({ name: `Layer ${layers.length}`, id: layers.length }, this.document);
		layers.splice(index, 0, newLayer);
		this.page.redraw();
		this.document.setActiveLayer(newLayer);
	}

	setLayerOpacity(value) {
		const { activeLayer } = this.document;
		if (activeLayer) {
			activeLayer.opacity = value;
			this.page.redraw();
			this.setState({});
		}
	}

	setLayerOverlay(value) {
		const { activeLayer } = this.document;
		if (activeLayer) {
			activeLayer.overlay = value;
			this.page.redraw();
			this.setState({});
		}
	}

	removeLayer() {
		const { layers } = this;
		let { active } = this.state;
		let rindex = layers.indexOf(active);
		layers.splice(rindex, 1);
		if (rindex > 0) rindex --;
		this.page.redraw();
		this.document.setActiveLayer(layers[rindex]);
	}

	render() {
		return template.call(this);
	}
}