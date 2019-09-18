const { ImageTranscoder, VideoTranscoder, DocumentTranscoder } = require('./transcoders');

class Transcoder {
	process(data, options) {
		const { exif } = options;
		//first, check what exactly file type transformation via mimeType
		const mimetype = (exif.contentType || exif.mimeType || 'application').split(';')[0];

		try {
			if(mimetype){
				var pts = mimetype.split('/'),
					mediatype = pts[0],
					app = pts[1];

				if(mediatype === 'image' && app === 'gif'){
					mediatype = 'video';
				}

				switch(mediatype){
					case 'video':
						return this.processVideo(data, options, app);
					case 'image':
						return this.processImage(data, options, app);
					case 'audio':
						return this.processAudio(data, options, app);
					case 'application':
						return this.processApplications(data, options, app);
				}
			}
			return [];
		} catch(error) {
			console.error("Error while trying transcoding", error);
		}
	}

	processVideo(data, options) {
		return VideoTranscoder.transcode(data, options);
	}

	processImage(data, options, app) {
		const res = {};
		if(app === 'gif'){
			console.log("Try to transcode gif");
		} else {
			res.thumbnail = ImageTranscoder.transcode(data, options);
		}
		return res;
	}

	processAudio(data, options, app) {
		return {};
	}

	processApplications(data, options, app) {
		const res = {};
		const isExcel = app === 'vnd.openxmlformats-officedocument.spreadsheetml.sheet';
		const isWord = ['vnd.ms-word', 'vnd.openxmlformats-officedocument.wordprocessingml.document'].indexOf(app) > -1;
		Object.assign(options, { isExcel, isWord });
		switch(app){
			case 'vnd.ms-word':
			case 'vnd.ms-excel':
			case 'vnd.openxmlformats-officedocument.wordprocessingml.document':
			case 'vnd.openxmlformats-officedocument.spreadsheetml.sheet':
				Object.assign(res, DocumentTranscoder.transcode(data, options));
			break;
		}
		return res;
	}
}


module.exports = new Transcoder();
