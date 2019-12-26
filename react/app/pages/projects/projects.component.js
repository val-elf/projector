import React from "react";
import PropTypes from "prop-types";
import { UIView } from "@uirouter/react";
import template from "./projects.template";
import { ProjectsService } from "~/api/models/project.model";
import './projects.component.less';

export default class Projects extends React.Component {
	static contextTypes = {
		t: PropTypes.func.isRequired,
		router: PropTypes.object
	}

	state = {
		projects: ProjectsService.getList(),
		sortBy: '_update._dt',
	};

	loader = React.createRef();

	setSort(event) {
		this.setState({
			sortBy: event.target.value,
		});
		this.refresh();
	}

	refresh(){
		const { projects } = this.state;
		projects.flush();
		this.setState({ projects });
	}

	async readNext(side){
		if (side && side !== 'bottom') return;
		const { projects } = this.state;
		const { meta } = projects;
		const pager = meta ? { page: meta.page + 1 } : { page: 1, count: 10, sort: this.state.sortBy, dir: 'desc'};

		if(!meta || meta.more) {
			this.setState({ load: true });
			await projects.load(pager);
			this.setState({ projects, load: false });
		}
	}

	createNewProject(){
		this.editor.open(ProjectsService.create());
	}

	render() {
		this.routeState = this.context.router.globals.current;
		return template.call(this);
	}
}
