import React from "react";
import PropTypes from "prop-types";
import { ModalService } from 'common/materials';
import { TimelineCard } from 'components/timeline';
import template from "./project-timelines.template";

export class ProjectTimelines extends React.Component {
	static contextTypes = {
		t: PropTypes.func.isRequired
	}

	state = { };

	async componentDidMount() {
		const timelines = await this.project.timelines.getList();
		this.setState({
			timelines
		});
	}

	get project() {
		return this.props.project;
	}

	async editTimeline(timeline) {
		try {
			const { timelines } = this.state;
			let newItem = !timeline;
			timeline = timeline || this.project.timelines.create({});
			const data = timeline.plain();
			await ModalService.open(TimelineCard, {
				title: timeline && timeline.name || this.context.t('APP_TIMELINE_NEW'),
				width: '300px',
				content: { timeline: data }
			});
			timeline.setData(data);
			await timeline.save();
			if (newItem) await timelines.load();
			this.setState({ timelines });
		} catch (error) {
			console.error('error', error);
		}
	}

	render() {
		return template.call(this);
	}
}
