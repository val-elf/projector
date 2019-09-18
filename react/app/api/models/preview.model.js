import { Model, Types, Type, Service } from "projector/api/engine";

export class Preview extends Model {
	height = Type.Number;
	width = Type.Number;
	preview = Type.String;
	type = Type.String;
	hash = Type.String;

	static config = {
		name: 'Preview'
	};
}

Service.registryModels(Preview);
