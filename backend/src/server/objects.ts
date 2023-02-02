import { http } from '~/utils/simpleHttp';
import { IRouter, TObjectId } from '../backend/core/models';
import { DbObjectController } from '../backend/entities/dbobjects';
import { Service } from '../network/service';
import * as md5 from "md5";
import { config } from '~/config';
import { DbBridge } from '~/backend/core/db-bridge';
import { IFile, IPreviewed } from '~/backend/entities/models/db.models';
import { Response } from '~/network';

export class ObjectsRouter implements IRouter {
	model: DbObjectController;
	private app: Service;

	configure(app: Service) {
		this.model = new DbObjectController(app);
		this.app = app;

		app.for(this.model)
			.get('/dbobjects/:objectId', this.getObject)
			.get('/dbobjects/:objectId/preview', this.getObjectPreview)
			.get('/dbobjects/:objectId/preview/:type', this.getObjectPreviewByType)
		;
	}

	getObject = async (key) => {
		const { response } = this.app;
		console.warn("[API] Get DbObject with KEY", key);
		const dbobject = await this.model.getDbObject(key.objectId);
		response.set(dbobject);
	}

	private notFound(response) {
		response.headers['Content-Type'] = 'text/plain';
		response.setError(new Error('Not found'), 404);
	}

	getPreviewHash = async (model, objectId) => {
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

	getObjectPreviewByType = async (key, ...args: any[]) => {
		console.warn("[API] Get DbObject preview by type", key, args);

		const { request, response } = this.app;
		const oldEtag = request.headers['if-none-match'];
		const requestCache = request.headers['cache-control'];
		return await this.getObjectPreviewInfo(key.objectId, key.type, oldEtag, requestCache, response);
	}

	getObjectPreview = async (key) => {
		console.warn("[API] Get DbObject preview", key);

		const { request, response } = this.app;
		const oldEtag = request.headers['if-none-match'];
		const requestCache = request.headers['cache-control'];
		let type = key._metadata.type;
		if (!type) {
			const dbobject = await this.model.getDbObject(key.objectId);
			type = dbobject && dbobject.type || undefined;
		}
		if (!type) throw new Error('type should be defined');
		return await this.getObjectPreviewInfo(key.objectId, type, oldEtag, requestCache, response);
	}

	getObjectPreviewInfo = async (objectId: TObjectId, type: string, oldEtag: string, requestCache: string, response: Response) => {
		response.setHeader('Content-Type', 'image/jpeg');
		response.setHeader('Cache-Control', 'max-age=86400');
		const objectModel = DbBridge.getBridge(type);
		try{
			const previewHash = await this.getPreviewHash(objectModel, objectId);
			if (!previewHash) return this.notFound(response);

			response.setHeader('ETag', previewHash);

			if (requestCache !== 'no-cache' && oldEtag === previewHash) {
				response.setStatus(304);
				return;
			}

			const object = await objectModel.getItem(objectId) as unknown as IPreviewed;
			const { preview } = object;
			if (!preview) return this.notFound(response);

			if (preview.preview) {
				const content = Buffer.from(object.preview.preview, 'base64');
				response.setStream(content);
			} else if (type === 'files') {
				const file = object as IFile;
				const tid = file._transcode;
				const transcoder = file.transcoder || config.transcoder;
				const tpreview = await http.get(`${transcoder}preview-data?tid=${tid}`);
				const opreview = JSON.parse(tpreview.toString());
				response.setStream(Buffer.from(opreview.preview, 'base64'));
			}
		} catch (error) { console.error('err', error); }
	}
}


