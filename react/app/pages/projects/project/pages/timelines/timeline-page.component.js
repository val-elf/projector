import React from "react";
import PropTypes from "prop-types";
import template from "./timeline-page.template";
import { store } from "~/index";

export class TimelinePage extends React.Component {

	static contextTypes = {
		t: PropTypes.func.isRequired
	};

	static getDerivedStateFromProps(props, state) {
		const { timeline, timespot } = props;
		const newState = Object.assign({}, state);
		if (newState.timeline !== timeline) {
			newState.timeline = timeline;
			newState.currentSpot = undefined;
			store.dispatch({type: 'SET_TIMELINE', timeline });
		}
		if (newState.currentSpot !== timespot) {
			newState.currentSpot = timespot;
		}
		return newState;
	}

	constructor() {
		super(...arguments);
		this.project = this.props.project;
	}

	state = {};

	get timeline() {
		return this.state.timeline;
	}

	selectSpot(spot) {
		const { stateService } = this.props.transition.router;
		stateService.go('app.projects.project.timelines.timeline', { timespot: spot.id });
	}

	editTimeline() {

	}

	deleteTimeline() {

	}

	timespotChanged() {
		const { currentSpot } = this.state;
		this.setState({ currentSpot });
	}

	render() {
		return template.call(this);
	}
}
