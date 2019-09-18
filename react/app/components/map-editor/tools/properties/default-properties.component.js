import React from 'react';
import PropTypes from 'prop-types';
import template from './default-properties.template.rt';
import { store } from 'projector/index';
import './default-properties.component.less';

export class DefaultProperties extends React.Component {
    static contextTypes = {
        t: PropTypes.func.isRequired
    }
    static getDerivedStateFromProps(props) {
        const { tool, locations } = props;
        const { location } = tool;
        const state = { tool, locations, location };
        const { parent } = location;
        if (parent && parent.location) {
            state.parentId = parent.location.id;
        }
        return state;
    }

    constructor() {
        super(...arguments);
        ['editor'].forEach(key => this[key] = this.props[key]);
    }

    get tool() { return this.state.tool; }
    get map() { return this.tool.map; }

    state = {};

	prepareLocation(file, fileData) {
		this.addImage(file, fileData);
	}

	changeParentLocation(value) {
		let { parent, location } = this.state;
		const parentId = value;
		const newLocation = this.state.locations.find(loc => loc.id === parentId);		
		if (!parent) {
			const offset = newLocation.position;
			const scale = 1 / newLocation.scale;
			parent = {
				scale: scale,
				position: { x: -offset.x * scale, y: -offset.y * scale },
			};
			location.parent = parent
		}
		location.parent.location = newLocation;
		this.setState({ parent, parentId, location });
        store.dispatch({ type: 'LOCATION_CHANGE_PARENT', parent: location.parent });
    }
    
    changeSelectedItem(item) {
        this.setState({ selected: item });
        this.map.selectItem(item, true);
        this.map.viewToSelected();
    }

	removeParentLocation() {
		const { location } = this.state;
		location.parent.location = undefined;
        this.setState({ parent: null, parentId: null, location });
        store.dispatch({ type: 'LOCATION_CHANGE_PARENT', parent: location.parent });
	}

	addImage(image, file) {
		this.tool.createImage(image, file);
	}

    render() {
        return template.call(this);
    }
}
