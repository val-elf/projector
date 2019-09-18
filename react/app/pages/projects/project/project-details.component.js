import React from "react";
import PropTypes from "prop-types";
import template from "./project-details.template";
import { ProjectTabMenu } from "./project.module";
import { AppContext } from '~/app/app.context';

export class ProjectDetails extends React.Component {
	static contextTypes = {
		t: PropTypes.func.isRequired,
	}

	static childContextTypes = {
		project: PropTypes.object.isRequired
	}

	getChildContext() {
		const { project } = this;
		return { project };
	}

	state = {
		dashboardMode: true
	}
	menu = ProjectTabMenu || [];

	get project() { return this.state.project };

	static getDerivedStateFromProps(props, state) {
		const newState = Object.assign({}, state);
		const { project, transition: { router } } = props;
		newState.dashboardMode = ProjectDetails.detectIsTabMode(router);
		newState.currentTabName = router.globals.current.name;

		if (state.project !== project) {
			Object.assign(newState, { project });
		}
		return newState;
	}

	static detectIsTabMode(router) {
		const { stateService : { $current: current } } = router;
		return current.name === 'app.projects.project' || current.includes['app.projects.project.tab'];
	}

	updateProject() {
		this.state.project.save();
	}

	changeProjectName(newName, apply) {
		if (apply) {
			this.state.project.name = newName;
			this.updateProject();
		}
	}

	render() {
		return <AppContext.Consumer>{ context => {
			context.project = this.state.project;
			return template.call(this);
		}}</AppContext.Consumer>
	}
}
