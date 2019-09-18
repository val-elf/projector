import { promisesProcess } from "projector/common/utils";

export class FileLoader {
	constructor(options) {
		this.inp = document.createElement("input");
		this.options = Object.assign({
			multiple: false
		}, options);
		this.init();
	}

	init() {
		this.inp.type = 'file';
		this.inp.accept = this.options.accept || 'image\/*';
		this.inp.multiple = this.options.multiple;
		this.inp.addEventListener('change', () => this.addFiles());
	}

	async addFiles() {
		try {
			await this.loadFiles();
			if (this.options.onLoad) await this.options.onLoad(this.files);
		} catch (err) {
			// TODO: make an warning for user about exception
		};
	}

	async itemLoad(file) {
		if (this.options.onItemLoad) await this.options.onItemLoad(this.files, file);
	}

	prepareVideo(file) {
		return new Promise((resolve, reject) => {
			const fr = new FileReader();
			fr.readAsArrayBuffer(file);
			fr.addEventListener('loadend', async () => {
				try {
					resolve(await this.prepareVieoPreview(fr, file));
				} catch (error) { }
			});
		});
	}

	prepareImage(file) {
		return new Promise((resolve, reject) => {
			const fr = new FileReader();
			fr.readAsDataURL(file);
			fr.addEventListener('loadend', async () => {
				try {
					resolve(await this.prepareImagePreview(fr.result, file));
				} catch (error) {
					reject(error);
				}
			});
		});
	}

	async processFile(file) {
		file.progress = 0;

		const fn = file.name.match(/\.([^\.]*)$/);
		const tp = file.type.match(/(.+)\/(.+)/);
		const ext = fn && fn[1] || null;
		const mimebase = tp && tp[1] || null
		const type = tp && tp[2] || null;

		file.fileInfo = {
			ext: ext,
			kind: mimebase,
			type: type
		};

		if (mimebase === 'image') {
			await this.prepareImage(file);
		} else if (mimebase === 'video') {
			await this.prepareVideo(file);
		}
		await this.itemLoad(file);
	}

	async loadFiles() {
		this.files = [...this.inp.files];
		const stack = [...this.inp.files];
		return await promisesProcess(stack, file => this.processFile(file));
	}

	prepareImagePreview(result, file) {
		const bcode = 'base64,';
		const pindex = result.indexOf(bcode);
		const previewData = result.substring(pindex + bcode.length);
		return new Promise((resolve, reject) => {
			const img = new Image();
			const data = {};
			file.preview = data;
			file.source = result;
			data.preview = previewData;
			img.src = result;
			data.type = file.type;
			img.addEventListener('load', () => {
				data.height = img.height;
				data.width = img.width;
				resolve(file);
			});
			img.addEventListener('error', (event) => {
				reject(event);
			});
		});
	}

	prepareVieoPreview(reader, file) {
		var blob = new Blob([reader.result], { type: file.type });
		var url = URL.createObjectURL(blob);
		var video = document.createElement('video');

		return new Promise((resolve, reject) => {
			var timeupdate = function () {
				if (snapImage()) {
					video.removeEventListener('timeupdate', timeupdate);
					video.pause();
				}
			};

			video.addEventListener('loadeddata', () => {
				const ctime = Math.round(Math.random() * video.duration * 10) / 10;
				video.currentTime = ctime < 5 ? ctime : 5;
			});

			video.addEventListener('error', () => {
				resolve(file);
			});

			const snapImage = function () {
				const canvas = document.createElement('canvas');
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
				const image = canvas.toDataURL();
				const bcode = 'base64,';
				const pindex = image.indexOf(bcode);
				const previewData = image.substring(pindex + bcode.length);
				file.preview = {
					preview: previewData,
					width: video.videoWidth,
					height: video.videoHeight
				}
				URL.revokeObjectURL(url);
				resolve(file);
				return true;
			};
			video.addEventListener('timeupdate', timeupdate);
			video.preload = 'metadata';
			video.src = url;
			// Load video in Safari / IE11
			video.muted = true;
			video.playsInline = true;
			video.play();
		});

	}

	open() {
		this.inp.value = null;
		this.inp.click();
	}

}