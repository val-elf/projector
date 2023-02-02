import { DbModel } from '../core/db-bridge';
import { TObjectId } from '../core/models';
import { DbObjectAncestor, DbObjectController } from './dbobjects';
import { PermissionsCheck } from './decorators/permissions-check';
import { IFile, IMetadata, IUser } from './models/db.models';
import { config } from "~/config";
import { http } from "~/utils/simpleHttp";

@DbModel({ model: 'files' })
export class Files extends DbObjectAncestor<IFile> {

	@PermissionsCheck({ permissions: [] })
	async createFile(fileInfo: IFile, user?: IUser) {
		fileInfo = DbObjectController.normalize(fileInfo, user);
		return this.model.create(fileInfo);
	}

	@PermissionsCheck({ permissions: [] })
	async updateFile(fileInfo: IFile, internal = false, user?: IUser) {
		const _user = !internal ? user : { internal };
		fileInfo = DbObjectController.normalize(fileInfo, user);
		return this.model.updateItem(fileInfo);
	}

	public async updateFileByTranscode(transcodeId: string, file: Partial<IFile>, internal = false) {
		if (!internal) await this.getCurrentUser();
		return this.model.update({_transcode: transcodeId}, file);
	}

	public async getFileByTranscode(transcodeId: string, internal = false) {
		if (!internal) await this.getCurrentUser();
		return this.model.find({ _transcode:transcodeId });
	}

	public async getFileInfo(id, internal: boolean = false) {
		if (!internal) await this.getCurrentUser();
		const res = await this.findFiles({ _id: id });
		return res[0];
	}

	public async findFiles(condition, meta?: any) {
		meta = meta || {};
		const files = await this.model.find(condition, { 'preview.preview': 0 }, meta);
		await (Promise.all(files.map(async file => {
			const iu1 = await this.getFileStatus(file);
			const iu2 = await this.detectFileState(file);
			if (iu1 || iu2) this.model.updateItem(file);
		})));
		return files;
	}

	@PermissionsCheck({ permissions: [] })
	public async getOwnerFiles(owner: TObjectId, metadata: IMetadata) {
		return this.model.findList({_owner: owner}, { 'preview.preview': 0 }, metadata);
	}

	@PermissionsCheck({ permissions: [] })
	public async removeFile(fileId: TObjectId, user?: IUser) {
		return this.deleteItem(fileId, user);
	}

	/*
	public hasStatusPassed(status, current) {
		// status changed line: new -> exif -> transcode -> finished
		const statuses = ['new', 'exif', 'transcode', 'finished'];
		if (current === 'finished') return true;
		if (current === 'unknown') return false;
		const cindex = statuses.indexOf(current);
		const sindex = statuses.indexOf(status);
		return cindex >= sindex;
	}
	*/

	private async detectFileState(file: IFile) {
		const { _transcode: tid, preview } = file;
		if (!tid) return;
		const transcoder = file.transcoder || config.transcoder;
		let needUpdate = false;
		const { _status: status } = file;

		if (!file.exif && tid && status && status.exif === 'ready') {
			const exif = await http.get(`${transcoder}exif-data?tid=${tid}`);
			if (exif) file.exif = JSON.parse(exif);
			needUpdate = true;
		}
		const hasPreviewData = preview && !!Object.keys(preview).length;
		if (!hasPreviewData && tid && status && status.preview === 'ready') {
			const previewData = await http.get(`${transcoder}preview-data?tid=${tid}`);
			try {
				const preview = JSON.parse(previewData);
				Object.assign(file, { preview });
				needUpdate = true;
			} catch (err) {
				console.error(err);
			}
		}
		return needUpdate;
	}

	private async getFileStatus(file) {
		let needUpdate = false;
		const { _status: status, _transcode: tid } = file;
		const transcoder = file.transcoder || config.transcoder;
		if (!status) return false;
		const { status: statusValue } = status;
		const needCheck = statusValue !== 'finished' && statusValue !== 'lost';
		if (tid && needCheck) { //get latest status
			try {
				const statusData = JSON.parse(await http.get(`${transcoder}status?tid=${tid}`));
				file._status = statusData;
				needUpdate = true;
			} catch (error) {
				file._status = { status: 'storage-down', tid };
			}
		}
		return needUpdate;
	}
}
