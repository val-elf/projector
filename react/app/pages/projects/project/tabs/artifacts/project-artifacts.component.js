import React from "react";
import PropTypes from "prop-types";
import template from "./project-artifacts.template";
import { ArtifactsService } from "api";
import './project-artifacts.component.less';

export class ProjectArtifacts extends React.Component {
	state = {
		artifacts: ArtifactsService.getList(this.project)
	};

	static contextTypes = {
		t: PropTypes.func.isRequired,
		project: PropTypes.object.isRequired
	}

	get project() { return this.context.project; }

	createArtifact() {
		return this.editArtifact(ArtifactsService.create({}, this.project));
	}

	async editArtifact(artifact) {
		try{
			await this.editor.open(true, { artifact });
			await artifact.save();
			const { artifacts } = this.state;
			artifacts.flush();
			this.refreshList();
		} catch (error) { }
	}

	async refreshList(side) {
		const { artifacts } = this.state;
		const { _meta } = artifacts;
		if (_meta && !_meta._.more) return;
		side = side || 'bottom';
		if (side === 'bottom') {
			await this.setState({ load: true });
			try {
				await artifacts.load({});
				this.setState({ artifacts, load: false });
			} catch (error) { }
		}
	}

	deleteArtifact() {

	}

	render() {
		return template.call(this);
	}
}
