import React from "react";
import PropTypes from "prop-types";
import template from "./project-editor.template";

export class ProjectEditor extends React.Component {
	static contextTypes = {
		t: PropTypes.func.isRequired
	}

	state = {}

	static getDerivedStateFromProps(props) {
		return {
			showed: !!props.showed,
		};
	}

	get projectName() {
		const { project } = this.state;
		return project && project.name || null;
	}

	open(project){
		this.setState({ project });
		const data = project.plain();
		return this.modal.open(true, {
			project: data
		}).then(result => {
			project.save(data);
		});
	}

	render(){
		return template.apply(this);
	}
}
