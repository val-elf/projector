import { Type, Service } from "~/api/engine";
import { CommonModel, DefaultModel } from "./default.model";
import { Preview } from "./preview.model";
import { Project } from "./project.model";
import { Character } from './character.model';

export class Involvement extends CommonModel {
	character = new Type(Character, {
		key: '_character',
		link: true,
		parent: artifact => artifact.project /* owner is an artifact object */
	});
	description = Type.String;
	role = Type.String;

	static config = {
		name: 'InvolvedCharacter'
	};
}

export class Artifact extends DefaultModel {
	name = Type.String;
	type = Type.String;
	subtype = Type.String;
	description = Type.String;
	preview = new Type(Preview);
	project = new Type(Project, { parent: true, key: '_project' });
	hasContent = Type.Boolean;
	info = Type.Base64;
	characters = new Type([Involvement]);

	static get route() {
		return 'app.projects.project.artifacts.artifact';
	}

	static config = {
		name: 'Artifact',
		url: 'artifacts'
	}
}

Service.registryModels(Involvement);
export const ArtifactsService = Service.createServiceFor(Artifact, Project);

export const ArtifactTypes = [
	'item',
	'toponym',
	'name',
	'phenomenon',
	'notion'
];

