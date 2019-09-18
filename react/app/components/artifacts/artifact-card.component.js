import React from "react";
import PropTypes from "prop-types";
import template from "./artifact-card.template";
import { ArtifactTypes } from "api";

export class ArtifactCard extends React.Component {
	static contextTypes = {
		t: PropTypes.func.isRequired
	}

	static getDerivedStateFromProps(props) {
		return {
			artifact: props.artifact,
			types: ArtifactTypes
		}
	}

	state = {};

	handleChange(field) {
		const { artifact } = this.state;
		return evt => {
			artifact[field] = evt.target ? evt.target.value : evt;
			this.setState({ artifact });
		}
	}

	setPreview(preview) {
		const { artifact } = this.state;
		artifact.preview = preview;
		this.setState({ artifact });
	}

	render() {
		return template.call(this);
	}
}