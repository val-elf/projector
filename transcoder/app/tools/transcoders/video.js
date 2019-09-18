const videoTranscoder = require ('stream-transcoder');
const DataReadableStream = require('@root/app/utils/data-readable-stream');
const Jimp = require('jimp');
const md5 = require('md5');

class VideoTranscoder {
    static getThumbnailPoint(exif){
        var duration = exif.duration;
        var	res = duration.split(':').reduce((res, item, index) => {
                var pts;
                if(index === 2){
                    pts = item.split('.');
                    pts[0] = parseInt(pts[0]);
                    if(pts[1]){
                        while(pts[1].length < 3) pts[1]+="0";
                        pts[1] = parseInt(pts[1]);
                    } else pts[1] = 0;
                }
                res = index < 2 ? res * 60 + parseInt(item) : res * 1000 + pts[0] * 1000 + pts[1] ;
                return res;
            }, 0);

        if(res > 10000) res = 10000;

        var point = Math.round(Math.random() * res);
        return point;
    }

    static transcode(data, options) {
		var thumbnailPoint = this.getThumbnailPoint(options.exif);
		const { image, onProgress } = options;
		const { width, height } = image;
		const result = {};
		result.thumbnail = VideoTranscoder.transcodeJob(data, {
			toThumbnail: true,
			width,
			height,
			thumbnailPoint: thumbnailPoint //this is should be gets from exif data
		});
		result.transcode = VideoTranscoder.transcodeJob(data, {
			width: options.width || 320,
			height: options.height || 240,
			format: options.format || 'flv',
			onProgress
		});
		return result;
    }

    static transcodeJob(data, options) {
        return new Promise((resolve, reject) => {
            const source = new DataReadableStream(data);
            const result = [];
            const { onProgress } = options;

            const trc = new videoTranscoder(source)
                .maxSize(options.width, options.height)
                .on('progress', ({ progress }) => {
                    const percents = Math.round(progress * 100);
                    if (onProgress) onProgress(percents);
                    console.log(`PROGRESS ${options.toThumbnail ? '(thumbnail) ' : ''}${percents}`);
                })
                .on('finish', () => {
                    const value = Buffer.concat(result);
                    if (options.toThumbnail) {
                        Jimp.read(value, (err, img) => {
                            if (err) {
                                reject(err);
                                return;
                            }
                            resolve({
                                value,
                                hash: md5(value),
                                ihash: img.hash(),
                                contentType: 'image/jpeg',
                                width: img.bitmap.width,
                                height: img.bitmap.height
                            });
                        });
                    } else resolve(value);
                })
                .on('error', error => {
                    console.error('error', error);
                    reject(error);
                })
            ;

            if(options.toThumbnail)
                trc
                    .captureFrame(options.thumbnailPoint)
            else {
                trc
                    .videoCodec(options.videoCodec || 'h264')
                    .videoBitrate(800 * 1000)
                    .fps(25)
                    .audioCodec(options.audioCodec || 'aac')
                    .sampleRate(44100)
                    .channels(2)
                    .audioBitrate(128 * 1000)
                    .format(options.format || 'mp4')
                ;
            }
            trc.stream().on('data', chunk => result.push(chunk));
        });
    }
}

module.exports = VideoTranscoder;