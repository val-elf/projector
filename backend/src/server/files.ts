import { utils } from '~/utils/utils';
import { Files } from '../backend';
import { IRouter } from '../backend/core/models';
import { Service } from '../network/service';
import { IFile } from '~/backend/entities/models/db.models';
import { config } from '~/config';
import { http } from '~/utils/simpleHttp';


export class FilesRouter implements IRouter {
	model: Files;
	private app: Service;

	configure(app: Service) {
		this.model = new Files(app);
		this.app = app;

		app.for(this.model)
			.post('/upload', this.upload, { streamable: true })
			.get('/file/:file', this.downloadFile)
			.get('/file/:file/status', this.getTranscoderStatus)
			.get('/owner/:owner/files', this.getOwnerFiles)
			.get('/owner/:owner/files/:file', this.getFileInfo)
			.get('/owner/:owner/files/:file/status', this.getTranscoderStatus)
			.delete('/owner/:owner/files/:file', this.deleteFile)
		;
	}

	upload = async (key, data) => {
		console.warn("[API] Upload the file", key);
		const { transcoder } = config;
		const completeOperation = async (file, content) => {
			try{
				const sessionId = ''; // await this.app.getCurrentSession(this);
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
			const fileInfo: Partial<IFile> = {
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
			this.app.response.setError(error, 403);
		}
	}

	getTranscoderStatus = async (key) => {
		try {
			const file = await this.model.getFileInfo(key.file);
			this.app.response.set(file._status);
		} catch (error) {
			this.app.response.setError(error);
		}
	}

	deleteFile = async (key) => {
		console.warn("[API] Delete Owner Document", key);
		await this.model.removeFile(key.file);
		return { deleted:true };
	}

	getFileInfo = async (key) => {
		console.warn('[API] Get File Info', key);
		return await this.model.getFileInfo(key.file);
	}

	downloadFile = async (key) => {
		console.warn("[API] Download file", key);
		const fileInfo = await this.model.getFileInfo(key.file);
		const transcodeId = fileInfo._transcode;
		const isTranscoded = !!transcodeId;
		const transcoder = fileInfo.transcoder || config.transcoder;
		const urlType = key._metadata.transcoded ? 'transcoding-data' : 'source-data';

		var contentType = isTranscoded ?
			(fileInfo.type.match(/^video\//) ? 'video/ogg' : 'text/html')
			: fileInfo.type || 'application/json'
		;

		this.app.response.headers['Content-Type'] = contentType;
		this.app.response.headers['Content-Disposition'] = '; filename=' + fileInfo.file;
		const url = `${transcoder}${urlType}?tid=${transcodeId}`;
		try {
			const result = await http.get(url);
			this.app.response.setStream(utils.getStreamFromBuffer(result));
		} catch (err) { this.app.response.setError(err); }
	}

	getOwnerFiles = async (key) => {
		console.warn("[API] Get owner files", key);
		return await this.model.getOwnerFiles(key.owner, key._metadata);
	}
}

