import React from "react";
import PropTypes from "prop-types";
import { LocationsService } from "api";
import template from "./project-locations.template";


export class ProjectLocations extends React.Component {
	static contextTypes = {
		t: PropTypes.func.isRequired
	}

	static getDerivedStateFromProps(props, state) {
		const newState = Object.assign({}, state);
		const { project } = props;
		if (newState.project !== project) newState.project = project;
		return newState;
	}

	state = {};

	async freshLocations(side) {
		side = side || 'bottom';
		if (side === 'bottom') {
			const locations = await LocationsService.getList({}, this.state.project);
			this.setState({ locations });
		}
	}

	createLocation() {
		const location = LocationsService.create({});
		this.editLocation(location);
	}

	editLocation(location) {
		this.editor.open(true, { location }).then(() => {
			location.save();
		}, () => {});
	}

	render() {
		return template.call(this);
	}
}
