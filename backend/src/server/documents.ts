import { EMethod, Router, Route } from '~/network';
import { Documents } from '../backend';
import { IFindList, IRouter } from '../backend/core/models';
import { Service } from '../network/service';
import { IDocument, IInitDocument } from '~/backend/entities/models';

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
// description: Documents management APIs
@Router()
export class DocumentsRouter implements IRouter {
	model: Documents;

	configure(app: Service) {
		this.model = new Documents(app);
	}

	// @OA:route
	// description: Create a document
	// security: [APIKeyHeader: []]
	// parameters: [ownerId: Id of the owner]
	// requestBody: [item: IInitDocument]
	// responses: [200: Return of the document, 401: Bad Request]
	@Route(EMethod.POST, '/owner/:ownerId/documents')
	public async createDocument(key, data: IInitDocument): Promise<IDocument> {
		console.warn('[API] create Document', key);
		return await this.model.createDocument(data, key.owner);
	}

	// @OA:route
	// description: Get owner documents
	// security: [APIKeyHeader:[]]
	// parameters: [ownerId: Id of the owner]
	// responses: [200: List of the owner's document, 401: Bad Request]
	@Route(EMethod.GET, '/owner/:ownerId/documents')
	public async getOwnerDocuments(key): Promise<IFindList<IDocument>> {
		console.warn('[API] Get Owner Documents', key);
		const list = await this.model.getDocuments(key.owner);
		return list;
	}

	// @OA:route
	// description: Delete a document
	// security: [APIKeyHeader:[]]
	// parameters: [documentId: Id of the document]
	// responses: [200: Deleted flag for the operation,401: Bad Request]
	@Route(EMethod.DELETE, '/documents/:documentId')
	public async deleteDocument(key): Promise<{ deleted: boolean }> {
		console.warn('[API] Delete Owner Document', key);
		const deleted = await this.model.removeDocument(key.document);
		return { deleted };
	}

	// @OA:route
	// description: Update a document
	// security: [APIKeyHeader:[]]
	// parameters: [documentId: Id of the updated document]
	// requestBody: [item: IInitDocument]
	// responses: [200: Updated document,401: Bad Request]
	@Route(EMethod.PUT, '/documents/:documentId')
	public async updateDocument(key, document: IInitDocument): Promise<IDocument> {
		console.warn('[API] Update Document', key);
		if (document) delete (document as any)._file;
		return await this.model.updateDocument(document);
	}

	// @OA:route
	// description: Get a particular document
	// security: [APIKeyHeader:[]]
	// parameters: [documentId: Id of the document]
	// responses: [200: Document item, 401: Bad Request]
	@Route(EMethod.GET, '/documents/:documentId')
	public async getDocument(key): Promise<IDocument> {
		console.warn('[API] Get Document', key);
		return await this.model.getDocument(key.document);
	}
}
