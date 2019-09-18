const Documents = require("../backend/documents");
const Files = require('../backend/files');
const http = require('../utils/simpleHttp');
const config = require('../config');

function detectMediaType(file){
	const res = {};
	const tp = file.type || file.exif && file.exif.mimeType || null;

	if(tp) {
		var mt = tp.match(/^(.+?)\/(.+)$/);
		res.mediatype = mt && mt[1] || 'unknown';
		mt[2] && (res.subtype = mt[2]);
	}
	return res;
}

module.exports.configure = function(app){
	const documents = new Documents(app);

	app.for(documents)
		.get('/owner/:owner/documents', getOwnerDocuments)
		.get('/owner/:owner/documents/:document', getDocument)
		.get('/documents/:document', getDocument)
		.post('/owner/:owner/documents', createDocument)
		.post('/documents', createDocument)
		.put('/owner/:owner/documents/:document', updateDocument)
		.put('/documents/:document', updateDocument)
		.delete('/owner/:owner/documents/:document', deleteDocument)
	;
}

async function createDocument(key, data){
	console.log("[API] create Document", key);
	if (key.owner) data._owner = key.owner;
	return await this.model.createDocument(data);
}

async function getOwnerDocuments(key){
	console.log("[API] Get Owner Documents", key);
	const list = await this.model.getDocuments(key.owner, key._metadata);
	list.data.forEach(item => {
		const { _file } = item;
		if(_file) Object.assign(item.metadata, detectMediaType(_file));
	});
	return list;
}

async function deleteDocument(key){
	console.log("[API] Delete Owner Document", key);
	await this.model.removeDocument(key.document);
	return { deleted: true };
}

async function updateDocument(key, document){
	console.log("[API] Update Document", key);
	if (document) delete document._file;
	return await this.model.updateDocument(document);
}

async function getDocument(key){
	console.log("[API] Get Document", key);
	return await this.model.getDocument(key.document);
}