import { promisesProcess } from "projector/common/utils";

export class FileSaver {
	constructor(options) {
		this.options = Object.assign({
			headers: {}
		}, options);
	}

	upload(url, file) {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			const fd = new FormData();

			fd.append("fileToUpload", file);

			xhr.upload.addEventListener("progress", evt => {
				file.progress = Math.round(evt.loaded / evt.total * 100);
				this.options.onProgress && this.options.onProgress(file, file.progress);
			});

			xhr.addEventListener("load", evt => {
				var obj = evt.target.response;
				if(obj) obj = JSON.parse(obj);
				file.uploaded = true;
				this.options.onPostload && this.options.onPostload(file, obj);
				resolve();
			});

			xhr.addEventListener("error", evt => {
				reject();
			});

			xhr.open("POST", url);
			const headers = this.options.headers;
			Object.keys(headers).forEach(header => xhr.setRequestHeader(header, headers[header]));
			xhr.send(fd);
		});
	}

	setUrl(url) {
		this.options.url = url;
	}

	async saveFile(file) {
		let url = this.options.url;
		if (this.options.onPreload) url = await this.options.onPreload(this.options.url, file);
		await this.upload(url, file);
	}

	save(files){
		return promisesProcess([...files], (file) => this.saveFile(file));
	}
}