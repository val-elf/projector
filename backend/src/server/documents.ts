import { Documents } from '../backend';
import { IRouter } from '../backend/core/models';
import { Service } from '../network/service';

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

export class DocumentsRouter implements IRouter {
	model: Documents;

	configure(app: Service) {
		this.model = new Documents(app);
		app.for(this.model)
			.get('/owner/:owner/documents', this.getOwnerDocuments)
			.get('/owner/:owner/documents/:document', this.getDocument)
			.get('/documents/:document', this.getDocument)
			.post('/owner/:owner/documents', this.createDocument)
			.post('/documents', this.createDocument)
			.put('/owner/:owner/documents/:document', this.updateDocument)
			.put('/documents/:document', this.updateDocument)
			.delete('/owner/:owner/documents/:document', this.deleteDocument)
		;
	}

	createDocument = async (key, data) => {
		console.warn("[API] create Document", key);
		if (key.owner) data._owner = key.owner;
		return await this.model.createDocument(data);
	}

	getOwnerDocuments = async (key) => {
		console.warn("[API] Get Owner Documents", key);
		const list = await this.model.getDocuments(key.owner, key._metadata);
		list.result.forEach(item => {
			const { _file } = item;
			if(_file) item.metadata = {
				...item.metadata,
				...detectMediaType(_file)
			};
		});
		return list;
	}

	deleteDocument = async (key) => {
		console.warn("[API] Delete Owner Document", key);
		await this.model.removeDocument(key.document);
		return { deleted: true };
	}

	updateDocument = async (key, document) => {
		console.warn("[API] Update Document", key);
		if (document) delete document._file;
		return await this.model.updateDocument(document);
	}

	getDocument = async (key) => {
		console.warn("[API] Get Document", key);
		return await this.model.getDocument(key.document);
	}
}
