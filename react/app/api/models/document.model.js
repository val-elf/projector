import { Model, Type, Types, Service } from "projector/api/engine";
import { DefaultModel, OwnerModel } from "./default.model";
import { Preview } from "./preview.model";
import { File } from "./file.model";

class Metadata extends Model {
	size = new Type(Types.number);
	type = new Type(Types.string);
	lastModified = new Type(Types.number);
	mediatype = new Type(Types.string);

	static config = {
		name: 'DocumentMetadata'
	}
}

Service.registryModels(Metadata);

export class Document extends DefaultModel {
	title = new Type(Types.string);
	metadata = new Type(Metadata);
	preview = new Type(Preview);
	file = new Type(File, { key: '_file' });
	owner = new Type(DefaultModel, { key: '_owner', parent: true});
	content = Type.Base64;

	static config = {
		name: 'Document',
		url: 'documents'
	}
}

class DocumentsServiceBase extends Service {
	createDocument(file, owner) {
		const doc = this.create(owner);
		Object.assign(doc, {
			title: file.name,
			metadata: {
				size: file.size,
				type: file.type,
				lastModified: file.lastModified
			}
		});

		return doc;
	}
}

export const DocumentsService = Service.createServiceFor(Document, OwnerModel, DocumentsServiceBase);

