import { utils } from '~/utils/utils';
import { Files } from '../backend';
import { IRouter } from '../backend/core/models';
import { Service } from '../network/service';
import { IFile } from '~/backend/entities/models';
import { config } from '~/config';
import { http } from '~/utils/simpleHttp';
import { EMethod, Route, Router } from '~/network';

// @OA:tag
// name: Files
// description: Files management API
@Router()
export class FilesRouter implements IRouter {
	model: Files;
	private app: Service;

	configure(app: Service) {
		this.model = new Files(app);
		this.app = app;
	}

	// @OA:route
	// description: Upload a file
	@Route(EMethod.POST, '/upload')
	public async upload(key, data) {
		console.warn('[API] Upload the file', key);
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
				name: header.parsed.filename,
				file: header.parsed.filename,
				size: content.length,
				_status: { status: 'new' },
				transcoder,
				type: header.parsed['content-type'],
			};
			const file = await this.model.createFile(fileInfo as IFile);
			completeOperation(file, content);
			return file;
		} catch (error) {
			this.app.response.setError(error, 403);
		}
	}

	// @OA:route
	// description: Get file transcoding status
	@Route(EMethod.GET, '/file/:fileId/status')
	public async getTranscoderStatus(key) {
		try {
			const file = await this.model.getFileInfo(key.file);
			this.app.response.set(file._status);
		} catch (error) {
			this.app.response.setError(error);
		}
	}

	// @OA:route
	// description: Delete a file
	@Route(EMethod.DELETE, '/files/:fileId')
	public async deleteFile(key) {
		console.warn('[API] Delete Owner File', key);
		await this.model.removeFile(key.file);
		return { deleted:true };
	}

	// @OA:route
	// description: Get file info
	@Route(EMethod.GET, '/file/:fileId')
	public async getFileInfo(key) {
		console.warn('[API] Get File Info', key);
		return await this.model.getFileInfo(key.file);
	}

	// @OA:route
	// description: Download file
	@Route(EMethod.GET, '/download/:fileId')
	public async downloadFile(key) {
		console.warn('[API] Download file', key);
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

	// @OA:route
	// description: Get files list for abstract object
	@Route(EMethod.GET, '/dbobject/:objectId/files')
	public async getOwnerFiles(key) {
		console.warn('[API] Get owner files', key);
		return await this.model.getOwnerFiles(key.objectId, key._metadata);
	}
}

