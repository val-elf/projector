import React from "react";
import PropTypes from "prop-types";
import { UIRouter, UIView } from "@uirouter/react";
import template from "./dashboard.template";
import { ProjectsService } from "~/api/models/project.model";

export class Dashboard extends React.Component {
	state = {
		projectsList: null,
		showForm: false
	};

	componentDidMount(){
		const projects = ProjectsService.getList({});
		this.setState({ projects });
	}

	addNewProject(){
		this.editor.open();
	}

	render() {
		return template.call(this);
	}
}


Dashboard.contextTypes = {
	t: PropTypes.func.isRequired,
}