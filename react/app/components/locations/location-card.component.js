import React from "react";
import PropTypes from "prop-types";
import template from './location-card.template';
import { LocationTypes } from "api";

export class LocationCard extends React.Component {
	static contextTypes = {
		t: PropTypes.func.isRequired
	};

	static getDerivedStateFromProps(props) {
		const { location } = props;
		return {
			location
		};
	}

	state = {};

	handleChanges(field) {
		const { location } = this.state;
		return evt => {
			location[field] = evt.target.value;
			this.setState({ location });
		}
	}

	setPreview(preview) {
		const { location } = this.state;
		location.preview = preview;
		this.setState({ location });
	}

	render() {
		return template.call(this);
	}
}