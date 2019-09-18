const { CommonEntity, Core } = require("./core");
const Files = require('./files');
const documents = Core.getModel("documents");

module.exports = class Documents extends CommonEntity {
	async createDocument(doc) {
		const user = await this.app.getCurrentUser();
		doc = Core.normalize(doc, user);
		return documents.create(doc);
	}

	get fileManager() {
		return Files.getInstance(this.app);
	}

	prepareDocumentFile(doc, file) {
		if(!doc.metadata.type && file.exif) {
			doc.metadata.type = file.exif.mimeType;
			file.type = file.exif.mimeType;
		}
	}

	async getDocuments(owner, metadata) {
		await this.app.getCurrentUser();
		const list = await documents.findList({ _owner: owner }, metadata);

		//get files if its consist
		var ids = list.data.map(item =>item._id);
		const filesList = await this.fileManager.findFiles({ _owner: { $in : ids } });
		const fl = filesList.reduce((res, item) => {
			res[item._owner] = item;
			return res;
		}, {});

		list.data.forEach(doc => {
			if(fl[doc._id]){
				doc._file = fl[doc._id];
				this.prepareDocumentFile(doc, doc._file);
			}
		});
		return list;
	}

	async getDocument(documentId) {
		await this.app.getCurrentUser();
		const document = await documents.getItem(documentId);
		const files = await this.fileManager.findFiles({ _owner: document._id });
		if (files.length) {
			document._file = files[0];
			this.prepareDocumentFile(document, files[0]);
		}
		return document;
	}

	async updateDocument(document) {
		const user = await this.app.getCurrentUser();
		document = Core.normalize(document, user);
		return documents.updateItem(document);
	}

	async removeDocument(docId) {
		const user = await this.app.getCurrentUser();
		return documents.deleteItem(docId, user);
	}
}
