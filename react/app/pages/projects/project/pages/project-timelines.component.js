import React from "react";
import PropTypes from "prop-types";
import { ModalService } from 'controls/materials';
import { TimelineCard } from 'components/timeline';
import template from "./project-timelines.template";
import { store } from "~/index";

export class ProjectTimelines extends React.Component {
	static contextTypes = {
		t: PropTypes.func.isRequired
	}

	state = {};

	static getDerivedStateFromProps(props, state) {
		const { timelines } = props;
		const newState = Object.assign({}, state);
		if (timelines !== state.timelines) Object.assign(newState, { timelines });
		// if (!state.timeline) Object.assign(newState, { timeline });
		return newState;
	}

	constructor(props, context) {
		super(props, context);
		this.unsubscribe = store.subscribe(() => {
			const { timeline } = store.getState().Project;
			this.setState({ timeline });
		});
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	async toggleLockTimeline() {
		const { timeline } = this.state;
		await timeline.toggleLocked();
		this.setState({ timeline });
	}

	async changeTimelineName(value) {
		const { timelines, timeline } = this.state;
		timeline.name = value;
		await timeline.save();
		this.setState({ timelines, timeline });
	}

	createTimeline() {
		this.editor.open();
	}

	setTimeline(timelineId) {
		const { stateService } = this.props.transition.router;
		stateService.go('app.projects.project.timelines.timeline', {
			timelineId
		});
	}

	async editTimeline() {
		const { timeline } = this.state;
		try {
			const clone = timeline.plain();
			await ModalService.open(TimelineCard, {
				title: timeline.name,
				width: '300px',
				content: { timeline: clone }
			});
			timeline.setData(clone);
			await timeline.save();
			this.setState({ timeline });
		} catch (error) { }
	}


	render() {
		return template.call(this);
	}
}
