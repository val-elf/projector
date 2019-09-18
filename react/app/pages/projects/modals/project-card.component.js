import React from "react";
import PropTypes from "prop-types";
import template from "./project-card.template";


export class ProjectCard extends React.Component {
	static contextTypes = {
		t: PropTypes.func.isRequired
	}

	constructor(props){
		super(props);
		this.mode = this.props.mode || 'edit';
		this.state = {
			project: this.props.project
		}
	}

	handleChanges(field) {
		return (e) => {
			this.state.project[field] = e.target.value
		}
	}

	setPreview(preview) {
		const { project } = this.state;
		project.preview = preview;
		this.setState({ project });
	}

	render(){
		return template.call(this);
	}
}
