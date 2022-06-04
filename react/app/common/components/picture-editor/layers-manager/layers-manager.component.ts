import { Component, createRef } from 'react';
import * as PropTypes from 'prop-types';
import template from './layers-manager.template.rt';
import './layers-manager.component.less';
import { PictureDocument } from '../document/document';
import { storage } from 'controls/picture-editor/store/store';
import { LayerStorage } from 'controls/picture-editor/store/layer.store';
import { OverlayMappingEnum, Layer } from 'controls/picture-editor/document';

export class LayersManager extends Component {
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

	state: {
		document?: PictureDocument,
		showed?: boolean,
		active?: LayerStorage
	} = {};

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

	removeLayerRef = createRef();
	get removeLayerAction() { return this.removeLayerRef.current; }

	get document() {
		return this.state.document;
	}
	get layers() {
		return this.document.layers;
	}

	get currentLayer() { return storage.state.activeLayer; }

	get editor() { return this.context.editor; }

	get page() { return this.editor.page; }

	get orderedLayers() {
		return [...this.layers].reverse();
	}

	componentDidMount() {
		storage.subscribe('setActiveLayer', this.changeActiveLayer);
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
		const { layers } = storage.state;
		const { active } = this.state;
		let index = layers.length;
		if (active) index = layers.indexOf(active) + 1;
		const newLayer = new Layer({ name: `Layer ${layers.length}`, id: `${layers.length}` }, this.document);
		// layers.splice(index, 0, newLayer);
		// this.page.redraw();
		this.document.setActiveLayer(newLayer);
	}

	setLayerOpacity(value: number) {
		const { activeLayer } = storage.state;
		if (activeLayer) {
			activeLayer.setOpacity(value);
			// this.page.redraw();
			// this.setState({});
		}
	}

	setLayerOverlay(value: OverlayMappingEnum) {
		const { activeLayer } = storage.state;
		if (activeLayer) {
			activeLayer.setComposite(value);
			// this.page.redraw();
			// this.setState({});
		}
	}

	removeLayer() {
		const { layers } = storage.state;
		let { active } = this.state;
		let rindex = layers.indexOf(active);
		layers.splice(rindex, 1);
		if (rindex > 0) rindex --;
		this.page.redraw();
		storage.setActiveLayer(layers[rindex]);
	}

	render() {
		return template.call(this);
	}
}