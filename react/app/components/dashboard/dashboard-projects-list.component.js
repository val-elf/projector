import React from "react";
import template from "./dashboard-projects-list.template.rt";

export class DashboardProjectsList extends React.Component {
	state = {
		loading: false
	};

	static getDerivedStateFromProps(props, state) {
		const newState = Object.assign({}, state);
		const { projects } = props;
		if (projects !== newState.initProjects) {
			Object.assign(newState, {
				initProjects: projects,
				projects
			});
		}
		return newState;
	}

	async initProjects() {
		const { projects, loading } = this.state;
		const isPromise = projects instanceof Promise;
		if (!isPromise || loading) return;
		await this.setState({ loading: true });
		const loaded = await projects;
		this.setState({ projects: loaded, loading: false });

	}

	async componentDidMount() {
		this.initProjects();
	}

	async componentDidUpdate() {
		this.initProjects();
	}

	render() {
		return template.call(this);
	}
}