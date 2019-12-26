import { Types, Type, Service } from "~/api/engine";
import { DefaultModel } from "./default.model";
import { Preview } from "./preview.model";

export class Project extends DefaultModel {
	name = new Type(Types.string);
	preview = new Type(Preview);
	description = new Type(Types.string);
	timelines = new Type(Service, { name: 'Timeline' });
	characters = new Type(Service, { name: 'Character' });

	static config = {
		name: 'Project',
		url: 'projects'
	};
}

export const ProjectsService = Service.createServiceFor(Project);
