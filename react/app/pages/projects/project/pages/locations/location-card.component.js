import React from "react";
import PropTypes from "prop-types";
import template from './location-card.template';

export class LocationCard extends React.Component {
	static contextTypes = {
		t: PropTypes.func.isRequired
	}

	static getDerivedStateFromProps(props) {
		const { location, locations } = props;
		return {
			location,
			locations
		}
	}

	get locations() {
		const { location } = this.state;
		return this.state.locations.filter(loc => loc.id !== location.id);
	}

	save() {
		this.editor.saveMap();
	}

	state = {};

	render() {
		return template.call(this);
	}
}