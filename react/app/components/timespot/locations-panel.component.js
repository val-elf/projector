import React from "react";
import PropTypes from "prop-types";
import template from "./locations-panel.template";

export class LocationsPanel extends React.Component {
	render() {
		return template.call(this);
	}
}

LocationsPanel.contextTypes = {
	t: PropTypes.func.isRequired
}
