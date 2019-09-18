const fs = require('fs');
const http = require('../utils/simpleHttp');
const config = require('../config');
const Files = require('../backend/files');
const utils = require('../utils/utils');

module.exports.configure = function(app){
	const fileManager = Files.getInstance(app);

	app.for(fileManager)
		.post('/upload', upload, { streamable: true })
		.get('/file/:file', downloadFile)
		.get('/file/:file/status', getTranscoderStatus)
		.get('/owner/:owner/files', getOwnerFiles)
		.get('/owner/:owner/files/:file', getFileInfo)
		.get('/owner/:owner/files/:file/status', getTranscoderStatus)
		.delete('/owner/:owner/files/:file', deleteFile)
	;
}

async function upload(key, data){
	console.log("[API] Upload the file", key);
	const { transcoder } = config;
	const completeOperation = async (file, content) => {
		try{
			const sessionId = await this.app.getCurrentSession(this);
			http.post(`${transcoder}?session=${sessionId}`,
				content,
				{},
				result => {
					var res = JSON.parse(result.toString());
					if(res.done) {
						file._transcode = res.id;
						file._status = { status: 'new' };
						this.model.updateFile(file);
					}
				}
			);
		}
		catch (error) {
			console.error('something went wrong', error);
		}
	}

	try {
		const { content, header } = await data.getData();
		const fileInfo = {
			_owner: key._metadata.owner,
			name: header.parsed.filename,
			file: header.parsed.filename,
			size: content.length,
			_status: { status: 'new' },
			transcoder,
			type: header.parsed['content-type'],
		};
		const file = await this.model.createFile(fileInfo);
		completeOperation(file, content);
		return file;
	} catch (error) {
		this.response.setError(error, 403);
	}
}

async function getTranscoderStatus(key) {
	try {
		const file = await this.model.getFileInfo(key.file);
		this.response.set(file._status);
	} catch (error) {
		this.response.setError(error);
	}
}

async function deleteFile(key) {
	console.log("[API] Delete Owner Document", key);
	await this.model.removeFile(key.file);
	return { deleted:true };
}

async function getFileInfo(key) {
	console.log('[API] Get File Info', key);
	return await this.model.getFileInfo(key.file);
}

async function downloadFile(key){
	console.log("[API] Download file", key);
	const fileInfo = await this.model.getFileInfo(key.file);
	const transcodeId = fileInfo._transcode;
	const isTranscoded = !!transcodeId;
	const transcoder = fileInfo.transcoder || config.transcoder;
	const urlType = key._metadata.transcoded ? 'transcoding-data' : 'source-data';

	var contentType = isTranscoded ?
		(fileInfo.type.match(/^video\//) ? 'video/ogg' : 'text/html')
		: fileInfo.type || 'application/json'
	;

	this.response.headers['Content-Type'] = contentType;
	this.response.headers['Content-Disposition'] = '; filename=' + fileInfo.file;
	const url = `${transcoder}${urlType}?tid=${transcodeId}`;
	try {
		const result = await http.get(url);
		this.response.setStream(utils.getStreamFromBuffer(result));
	} catch (err) { this.response.setError(err); }
}

async function getOwnerFiles(key){
	console.log("[API] Get owner files", key);
	return await this.model.getOwnerFiles(key.owner, key._metadata);
}