import { DbBridge, DbModel } from '../core/db-bridge';
import { DbObjectAncestor } from './dbobjects';
import { Files } from './files';
import { IDocument } from './models/db.models';


@DbModel({ model: 'documents' })
export class Documents extends DbObjectAncestor<IDocument> {
	async createDocument(doc) {
		doc = this.dbObject.normalize(doc);
		return this.model.create(doc);
	}

	get fileManager() {
		return DbBridge.getInstance<Files>('files');
	}

	prepareDocumentFile(doc, file) {
		if(!doc.metadata.type && file.exif) {
			doc.metadata.type = file.exif.mimeType;
			file.type = file.exif.mimeType;
		}
	}

	async getDocuments(owner, metadata) {
		const list = await this.model.findList({ _owner: owner }, metadata);

		//get files if its consist
		const ids = list.result.map(item =>item._id);
		const filesList = await this.fileManager.findFiles({ _owner: { $in : ids } });
		const fl = filesList.reduce((res, item) => {
			res[item._owner.toString()] = item;
			return res;
		}, {});

		list.result.forEach(document => {
			if(fl[document._id.toString()]){
				const file = fl[document._id.toString()];
				this.prepareDocumentFile(document, file);
			}
		});
		return list;
	}

	async getDocument(documentId) {
		const document = await this.model.getItem(documentId);
		const files = await this.fileManager.findFiles({ _owner: document._id });
		if (files.length) {
			document.file = files[0];
			this.prepareDocumentFile(document, files[0]);
		}
		return document;
	}

	async updateDocument(document: IDocument) {
		const _document = this.dbObject.normalize(document);
		return this.model.updateItem(_document);
	}

	async removeDocument(docId) {
		return this.deleteItem(docId);
	}
}
