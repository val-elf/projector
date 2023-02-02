import { DbBridge, DbModel } from '../core/db-bridge';
import { TFindList, TObjectId } from '../core/models';
import { DbObjectAncestor, DbObjectController } from './dbobjects';
import { PermissionsCheck } from './decorators/permissions-check';
import { Files } from './files';
import { IDocument, IFile, IUser } from './models/db.models';


@DbModel({ model: 'documents' })
export class Documents extends DbObjectAncestor<IDocument> {

	@PermissionsCheck({ permissions: [] })
	async createDocument(doc: IDocument, user?: IUser) {
		doc = DbObjectController.normalize(doc, user);
		return this.model.create(doc);
	}

	get fileManager() {
		return DbBridge.getInstance<Files>('files');
	}

	private prepareDocumentFile(doc: IDocument, file: IFile) {
		if(!doc.metadata.type && file.exif) {
			doc.metadata.type = file.exif.mimeType as string;
			file.type = file.exif.mimeType as string;
		}
	}

	@PermissionsCheck({ permissions: [] })
	public async getDocuments(owner, metadata) {
		const list = (await this.model.findList({ _owner: owner }, metadata)) as TFindList<IDocument>;

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

	@PermissionsCheck({ permissions: [] })
	public async getDocument(documentId: TObjectId) {
		const document = await this.model.getItem(documentId);
		const files = await this.fileManager.findFiles({ _owner: document._id });
		if (files.length) {
			document.file = files[0];
			this.prepareDocumentFile(document, files[0]);
		}
		return document;
	}

	@PermissionsCheck({ permissions: [] })
	async updateDocument(document: IDocument, user?: IUser) {
		const _document = DbObjectController.normalize(document, user);
		return this.model.updateItem(_document);
	}

	@PermissionsCheck({ permissions: [] })
	public async removeDocument(docId: TObjectId, user?: IUser) {
		return this.deleteItem(docId, user);
	}
}
