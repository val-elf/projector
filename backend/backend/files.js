const { Core, CommonEntity } = require('./core');
const fileModel = Core.getModel('files');
const http = require('../utils/simpleHttp');
const config = require('../config');

module.exports = class Files extends CommonEntity {
	static getInstance(application) {
		if (this.instance) return this.instance;
		this.instance = new Files(application);
		return this.instance;
	}

	async createFile(fileInfo) {
		const user = this.app.getCurrentUser();
		fileInfo = Core.normalize(fileInfo, user);
		return fileModel.create(fileInfo);
	}

	async updateFile(fileInfo, internal = false) {
		const user = !internal ? await this.app.getCurrentUser() : { internal };
		fileInfo = Core.normalize(fileInfo, user);
		return fileModel.updateItem(fileInfo);
	}

	async updateFileByTranscode(transcodeId, file, internal = false) {
		if (!internal) await this.app.getCurrentUser();
		return fileModel.update({_transcode: transcodeId}, file);
	}

	async getFileByTranscode(transcodeId, internal = false) {
		if (!internal) await this.app.getCurrentUser();
		return fileModel.find({ _transcode:transcodeId });
	}

	async getFileInfo(id, trusted) {
		if (!trusted) await this.app.getCurrentUser();
		const res = await this.findFiles({ _id: id });
		return res[0];
	}

	async findFiles(condition, meta) {
		meta = meta || {};
		const files = await fileModel.find(condition, { 'preview.preview': 0 }, meta);
		await (Promise.all(files.map(async file => {
			const iu1 = await this.getFileStatus(file);
			const iu2 = await this.detectFileState(file);
			if (iu1 || iu2) fileModel.updateItem(file);
		})));
		return files;
	}

	async getOwnerFiles(owner, metadata) {
		await this.app.getCurrentUser();
		return fileModel.findList({_owner: owner}, { 'preview.preview': 0 }, metadata);
	}

	async removeFile(fileId) {
		const user = await this.app.getCurrentUser();
		return fileModel.deleteItem(fileId, user);
	}

	hasStatusPassed(status, current) {
		// status changed line: new -> exif -> transcode -> finished
		const statuses = ['new', 'exif', 'transcode', 'finished'];
		if (current === 'finished') return true;
		if (current === 'unknown') return false;
		const cindex = statuses.indexOf(current);
		const sindex = statuses.indexOf(status);
		return cindex >= sindex;
	}

	async detectFileState(file) {
		const { _transcode: tid, preview, exif } = file;
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

	async getFileStatus(file) {
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
