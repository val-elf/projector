import { EMethod, Router, Route } from '~/network';
import { Documents } from '../backend';
import { IRouter } from '../backend/core/models';
import { Service } from '../network/service';
import { IDocument } from '~/backend/entities/models';

function detectMediaType(file: any){
	const res: any = {};
	const tp = file.type || file.exif && file.exif.mimeType || null;

	if(tp) {
		var mt = tp.match(/^(.+?)\/(.+)$/);
		res.mediatype = mt && mt[1] || 'unknown';
		mt[2] && (res.subtype = mt[2]);
	}
	return res;
}

// @OA:tag
// name: Documents
@Router()
export class DocumentsRouter implements IRouter {
	model: Documents;

	configure(app: Service) {
		this.model = new Documents(app);
	}

	// @OA:route
	// description: Create a document
	@Route(EMethod.POST, '/owner/:owner/documents')
	public async createDocument(key, data: IDocument & { _owner?: string }) {
		console.warn('[API] create Document', key);
		if (key.owner) data._owner = key.owner;
		return await this.model.createDocument(data);
	}

	// @OA:route
	// description: Get owner documents
	@Route(EMethod.GET, '/owner/:owner/documents')
	public async getOwnerDocuments(key) {
		console.warn('[API] Get Owner Documents', key);
		const list = await this.model.getDocuments(key.owner);
		/*list.result.forEach(item => {
			const { _file } = item;
			if(_file) item.metadata = {
				...item.metadata,
				...detectMediaType(_file)
			};
		});*/
		return list;
	}

	// @OA:route
	// description: Delete a document
	@Route(EMethod.DELETE, '/documents/:document')
	public async deleteDocument(key) {
		console.warn('[API] Delete Owner Document', key);
		await this.model.removeDocument(key.document);
		return { deleted: true };
	}

	// @OA:route
	// description: Update a document
	@Route(EMethod.PUT, '/documents/:documentId')
	public async updateDocument(key, document) {
		console.warn('[API] Update Document', key);
		if (document) delete document._file;
		return await this.model.updateDocument(document);
	}

	// @OA:route
	// description: Get a document
	@Route(EMethod.GET, '/documents/:document')
	public async getDocument(key) {
		console.warn('[API] Get Document', key);
		return await this.model.getDocument(key.document);
	}
}
