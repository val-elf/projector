import React from "react";
import PropTypes from "prop-types";
import template from "./project-list-card.template";

export class ProjectListCard extends React.Component {
	static contextTypes = {
		t: PropTypes.func.isRequired,
	};

	static getDerivedStateFromProps(props) {
		return {
			project: props.project
		}
	}

	state = {};

	editProject(project){
		this.props.editor.open(this.state.project).then(project => {
			this.setState({ project })
		});
	}

	render() {
		return template.apply(this);
	}
}

