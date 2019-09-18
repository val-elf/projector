import { Type, Types, Service } from "projector/api/engine";
import { DefaultModel, OwnerModel } from "./default.model";
import { Preview } from "./preview.model";

export class File extends DefaultModel {
	exif = new Type(Types.object, { readonly: true });
	name = Type.String;
	file = Type.String;
	preview = new Type(Preview);
	size = Type.Number;
	type = Type.String;
	owner = new Type(OwnerModel, { key: '_owner', parent: true });
	status = new Type(Types.object, { key: '_status' });

	static config = {
		name: 'File',
		url: 'files'
	};

	async freshStatus() {
		this.status = await this.getServiceData('status');
		return this.status;
	}
}

export const FilesService = Service.createServiceFor(File, OwnerModel);
