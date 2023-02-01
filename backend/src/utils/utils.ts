const previewSize = 75;

import { Readable } from "stream";

const maxSize = (v1, v2) => {
	return v1 > v2;
}

class DataReadableStream extends Readable {
	private _sended: number = 0;

	constructor(public data) {
		super();
	}

	_read(size: number) {
		if(!this._sended) this.push(this.data);
		else this.push(null);
		this._sended = this.data.length;
	}
}

export const utils = {
	getStreamFromBuffer: function(buffer) {
		return new DataReadableStream(buffer);
	},
	preparePreview: function(preview){
		return new Promise((resolve, reject) => {
			if(preview && preview.preview){
				var Jimp = require('jimp'),
					Buffer = require('buffer').Buffer
				;
				const md5 = require('md5');
				var content = new Buffer(preview.preview, 'base64');
				Jimp.read(content, function(err, img){
					//var res = new Buffer();
					const { width, height } = img.bitmap;
					const [maxDim, anoDim] = maxSize(width, height) ? ['height', 'width'] : ['width', 'height'];
					if(img.bitmap[maxDim] > previewSize) {
						const newDimenstions = {
							[anoDim]: Math.floor(img.bitmap[anoDim] / img.bitmap[maxDim] * previewSize),
							[maxDim]: previewSize
						};
						const dimensions = ['width', 'height'].map(dim => newDimenstions[dim]);
						img
							.resize(...dimensions)
							.getBuffer(Jimp.MIME_PNG, (err, buff) => {
								if (err) reject(err);
								const { width, height } = img.bitmap;
								const pdata = buff.toString('base64');
								const hash = md5(pdata);
								Object.assign(preview, {
									preview: pdata,
									width,
									height,
									hash
								});
								resolve(preview);
							})
						;
					} else {
						if(!preview.width || !preview.height){
							preview.width = img.bitmap.width;
							preview.height = img.bitmap.height;
						}
						resolve(preview);
					}
				});
			} else resolve(preview);
		});
	}
}