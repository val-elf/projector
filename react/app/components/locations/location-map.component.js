import React from "react";
import PropTypes from "prop-types";
import template from './location-map.template';
import './location-map.component.less';

export class LocationMap extends React.Component {
	static contextTypes = {
		t: PropTypes.func.isRequired
	}
	static getDerivedStateFromProps(props) {
		const { location, locations } = props;
		const { parent } = location;
		return { location, locations, parent };
	}

	async componentDidMount() {
		const { parent } = this.state;
		if (parent) {
			await parent.location;
			if (!parent.location) this.setState({ parent: null });
			else this.setState({ parent, parentId: parent.location.id });
		}
	}

	state = {};

	getToolProperties() {
		const { tool } = this.state;
		if (tool) {
			const component = tool.getPropertiesComponent();			
			if (component) return React.createElement(component, { tool: tool, locations: this.state.locations });
		}
		return (<div>{this.context.t('APP_PROJECT_MAP_TOOL_HAS_NO_PROPERTIES')}</div>);
	}

	setTool(tool) {
		this.setState({ tool });
	}

	saveMap() {
		this.mapEditor.save();
	}

	render() {
		return template.call(this);
	}
}