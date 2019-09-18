import React from 'react';
import PropTypes from 'prop-types';
import { DefaultProperties } from './properties/default-properties.component';
import './default-tool.less';

export class DefaultTool extends React.Component {
	state = {};
	fired = {};

	static contextTypes = {
		locationEditor: PropTypes.object.isRequired
	}

	get editor() {
		return this.context.locationEditor;
	}

	get location() {
		return this.editor.location;
	}

	get map() {
		return this.editor.map;
	}

	get viewport() {
		return this.map.viewport;
	}

	componentDidMount() {
		const { defaultSelected } = this.props;
		if (defaultSelected)
			this.select();
	}

	componentWillUnmount() {
		this.props.onSelect && this.props.onSelect(this, false);
	}

	unselect() {
		this.setState({ selected: false });
	}

	select() {
		this.setState({ selected : true });
		if (this.props.onSelect)
			this.props.onSelect(this, true);
	}

	activate() {}
	deactivate() {}

	getPropertiesComponent() {
		return DefaultProperties;
	}

	getFired(eventType, clear) {
		let mesh = this.fired[eventType];
		if (!mesh) {
			mesh = [];
			this.fired[eventType] = mesh;
		}
		if (clear) this.fired[eventType] = [];
		return mesh;
	}

	click(item, ...params) {
		const mesh = this.getFired('click');
		mesh.push({ item: item, params });
	}

	drag(item, ...params) {
		const mesh = this.getFired('drag');
		mesh.push({ item: item, params });
	}

	processParams = (paramsList, cb) => {
		paramsList.forEach(({params, mesh}) => cb.call(this, mesh, ...params));
	};

	processAll() {
		const types = Object.keys(this.processeds);
		types.forEach(eventType => {
			const paramsList = this.processeds[eventType];
			try {
				switch(eventType) {
					case 'click':
						this.processParams(paramsList, this.processClick);
						break;
					case 'drag':
						// if we have a drag, click should be removed
						this.processeds['click'] = [];
						this.processParams(paramsList, this.processDrag);
						break;
					case 'key':
						this.processParams(paramsList, this.processKey);
						break;
					case 'keyRelease':
						this.processParams(paramsList, this.processKeyRelease);
						break;
				}
			} finally {
				this.processeds[eventType] = [];
			}
		});
		this.processeds = {};
		this._proc = null;
	}

	processeds = {};

	processDrag() {}
	processClick() {}
	processKey() {}
	processKeyRelease() {}

	process(eventType, ...params) {
		if (!this.processeds[eventType]) this.processeds[eventType] = [];
		const mesh = this.getFired(eventType, true);
		this.processeds[eventType].push({ params, mesh });
		if (!this._proc) this._proc = setTimeout(() => this.processAll());
	}
}
