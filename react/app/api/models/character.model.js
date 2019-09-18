import { Model, Type, Types, Service } from "projector/api/engine";
import { CommonModel, DefaultModel } from "./default.model";
import { Preview } from "./preview.model";
import { Project } from "./project.model";

export class CharacterDate extends Model {
	type = Type.String;
	date = Type.Date;
	static config = {
		name: 'CharacterDate'
	}
}

export class CharacterInvolvement extends CommonModel {
	artifact = new Type(Types.id, { key: '_artifact', readonly: true });
	name = Type.String
	type = Type.String;
	subtype = Type.String;
	role = Type.String;
	description = Type.String;
	preview = new Type(Preview);

	get previewUrl() {
		return `/srv/dbobjects/${this.artifact}/preview/artifacts`;
	}

	static get route() {
		return 'app.projects.project.artifacts.artifact';
	}

	static get modelName() {
		return 'artifactId';
	}

	static config = {
		name: 'CharacterInvolvement',
		url: 'involvement'
	}
}

export class Character extends DefaultModel {
	name = Type.String;
	fullName = Type.String;
	type = Type.String;
	description = Type.String;
	preview = new Type(Preview);
	dates = new Type([CharacterDate]);
	project = new Type(Project, { key: '_project', parent: true });
	involvement = new Type(Service, { name: 'CharacterInvolvement' });

	get infolist() { return []; }

	static get route() {
		return 'app.projects.project.characters.character';
	}

	static config = {
		name: 'Character',
		url: 'characters',
	};
}

Service.registryModels(CharacterDate);

export const CharactersService = Service.createServiceFor(Character, Project);
Service.createServiceFor(CharacterInvolvement, Character);

export const CharacterTypes = [
	'protagonist',
	'first-plain',
	'second-plain',
	'secondary'
]
