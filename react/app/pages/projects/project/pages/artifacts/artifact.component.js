import React from 'react';
import PropTypes from 'prop-types';
import { ProjectLinkSelector } from 'components/projects/project-link-selector.component';
import template from './artifact.template';

export class Artifact extends React.Component {
	static contextTypes = {
		t: PropTypes.func.isRequired
	}

	static getDerivedStateFromProps(props) {
		const { artifact } = props;
		return { artifact };
	}

	state = {
		fullScreen: false
	}

	editorOptions = {
		linkSelector: ProjectLinkSelector,
		hasPictures: true
	}

	changeDescription(value) {
		this.info = value;
	}

	async editArtifact() {
		await this.editor.open(true, { artifact: this.state.artifact });
		const artifact = await this.state.artifact.save();
		this.setState({ artifact });
	}

	save() {
		if (this.info) {
			this.state.artifact.save({ info: this.info });
		}
	}

	setFullScreen(value) {
		this.setState({ fullScreen: value });
	}

	toggleFullScreen() {
		let { fullScreen } = this.state;
		fullScreen = !fullScreen;
		this.setState({ fullScreen });
	}

	render() {
		return template.call(this);
	}
}