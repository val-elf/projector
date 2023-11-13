import { utils } from '~/utils/utils';
import { DbBridge, DbModel } from '../core';
import { IFindList, TObjectId } from '../core/models';
import { DbObjectAncestor } from './dbbase';
import { PermissionsCheck } from './decorators/permissions-check';
import { Files } from './files';
import { IInitDocument, IDocument, IFile } from './models';

type TDocumentUpdate = IInitDocument & Partial<IFile>;

@DbModel({ model: 'documents' })
export class Documents extends DbObjectAncestor<IDocument, TDocumentUpdate> {
	private get fileManager() {
		return DbBridge.getInstance<Files>('files');
	}

	@PermissionsCheck({ permissions: [] })
	async createDocument(doc: IInitDocument, ownerId: string) {
		this.setOwners([ownerId]);
		const document = await utils.preparePreview<TDocumentUpdate>(doc);
		return this.model.create(document);
	}

	private prepareDocumentFile(doc: IDocument, file: IFile) {
		// console.log('Doc', doc, 'file', file);
		if(!doc.metadata?.type && file.exif) {
			if (!doc.metadata) {
				doc.metadata = {};
			}
			doc.metadata.type = file.exif.mimeType as string;
			file.type = file.exif.mimeType as string;
		}
	}

	@PermissionsCheck({ permissions: [] })
	public async getDocuments(owner: string): Promise<IFindList<IDocument>> {
		console.log('Getting documents with owner', owner);
		this.setOwners(owner);
		const list = (await this.model.findList()) as IFindList<IDocument>;

		//get files if its consist
		const fileOwners = list.result.map(item => (item._id as string));

		// should be reimplemented
		const filesList = await this.fileManager.findFiles({}, fileOwners);

		const fl = filesList.reduce((res, file) => {
			res[file._id as string] = file;
			return res;
		}, {});

		list.result.forEach(document => {
			if(fl[document._id as string]){
				const file = fl[document._id as string];
				this.prepareDocumentFile(document, file);
			}
		});
		return list;
	}

	@PermissionsCheck({ permissions: [] })
	public async getDocument(documentId: TObjectId) {
		const document: IDocument = await this.model.getItem(documentId);
		const files = await this.fileManager.findFiles({ _owner: document._id });
		if (files.length) {
			document.file = files[0];
			this.prepareDocumentFile(document, files[0]);
		}
		return document;
	}

	@PermissionsCheck({ permissions: [] })
	async updateDocument(document: IInitDocument) {
		const updateItem = await utils.preparePreview<TDocumentUpdate>(document);
		return this.model.updateItem(updateItem);
	}

	@PermissionsCheck({ permissions: [] })
	public async removeDocument(docId: TObjectId) {
		return this.deleteItem(docId);
	}
}
