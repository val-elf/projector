const DbObjects = require('../backend/dbobjects');
const { Core } = require('../backend/core');
const md5 = require('md5');
const config = require('../config');
const http = require('../utils/simpleHttp');


module.exports.configure = function(app){
	const dbobjects = new DbObjects(app);
	app.for(dbobjects)
		.get('/dbobjects/:objectId', getObject)
		.get('/dbobjects/:objectId/preview', getObjectPreview)
		.get('/dbobjects/:objectId/preview/:type', getObjectPreviewByType)
	;
}

async function getObject(key) {
	console.log("[API] Get DbObject with KEY", key);
	const dbobject = await this.model.getDbObject(key.objectId);
	this.response.set(dbobject);
}

function notFound(response) {
	response.headers['Content-Type'] = 'text/plain';
	response.setError(new Error('Not found'), 404);
}

async function getPreviewHash(model, objectId) {
	let obj = await model.find({ _id: objectId }, { 'preview.hash': 1 }, {});
	obj = obj.pop();
	if (obj.preview && obj.preview.hash) return obj.preview.hash;
	obj = await model.find({ _id: objectId }, { 'preview.preview': 1 }, {});
	obj = obj.pop();
	if (!obj || !obj.preview) return;
	const hash = md5(obj.preview.preview);
	model.update({ _id: objectId }, { $set: {'preview.hash': hash } });
	return hash;
}

async function getObjectPreviewByType(key) {
	console.log("[API] Get DbObject preview by type", key, arguments);
	const oldEtag = this.request.headers['if-none-match'];
	const requestCache = this.request.headers['cache-control'];
	return await getObjectPreviewInfo(key.objectId, key.type, oldEtag, requestCache, this.response);
}

async function getObjectPreview(key) {
	console.log("[API] Get DbObject preview", key);
	const oldEtag = this.request.headers['if-none-match'];
	const requestCache = this.request.headers['cache-control'];
	let type = key._metadata.type;
	if (!type) {
		const dbobject = await this.model.getDbObject(key.objectId);
		type = dbobject && dbobject.type || undefined;
	}
	if (!type) throw new Error('type should be defined');
	return await getObjectPreviewInfo(key.objectId, type, oldEtag, requestCache, this.response);
}

async function getObjectPreviewInfo(objectId, type, oldEtag, requestCache, response) {
	response.setHeader('Content-Type', 'image/jpeg');
	response.setHeader('Cache-Control', 'max-age=86400');
	const objectModel = Core.getModel(type);
	try{
		const previewHash = await getPreviewHash(objectModel, objectId);
		if (!previewHash) return notFound(response);

		response.setHeader('ETag', previewHash);

		if (requestCache !== 'no-cache' && oldEtag === previewHash) {
			response.setStatus(304);
			return;
		}

		const object = await objectModel.getItem(objectId);
		const { preview } = object;
		if (!preview) return notFound(response);

		if (preview.preview) {
			const content = Buffer.from(object.preview.preview, 'base64');
			response.setStream(content);
		} else if (type === 'files') {
			const tid = object._transcode;
			const transcoder = object.transcoder || config.transcoder;
			const tpreview = await http.get(`${transcoder}preview-data?tid=${tid}`);
			const opreview = JSON.parse(tpreview.toString());
			response.setStream(Buffer.from(opreview.preview, 'base64'));
		}
	} catch (error) { console.error('err', error); }
}
