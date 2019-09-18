const Jimp = require('jimp');
const md5 = require('md5');

class ImageTranscoder {

	static computeImageData(img, width, height) {
		const ow = img.bitmap.width;
		const oh = img.bitmap.height;

		return new Promise((resolve, reject) => {
			if(ow > width || oh > height) {
				const nheight = oh > ow ? height /* case when height more than width*/
							: Math.ceil(oh / ow * width);
				const nwidth = ow > oh ? width /* case when width more than height */
						: Math.ceil(ow / oh * height);

				console.log("WxH %s x %s", nwidth, nheight, width, height);
				img
					.resize(nwidth, nheight)
					.getBuffer(Jimp.MIME_PNG, (err, buff) => {
						if (err) {
							reject(err);
							return;
						}
						resolve({
							contentType: 'image/png',
							value: buff,
							hash: md5(buff),
							ihash: img.hash(),
							width: nwidth,
							height: nheight
						});
					});
			} else {
				try {
					img.getBuffer(Jimp.MIME_PNG, (err, buff) => {
						if (err) {
							reject(err);
							return;
						}
						resolve({
							contentType: 'image/png',
							value: buff,
							width: ow,
							height: oh
						});
					});
				} catch (error) {
					reject(error);
				}
			}
		});
	}

    static async transcode (data, options) {
        try {
            const img = await Jimp.read(data);
            const width = options.image && options.image.width || 150;
            const height = options.image && options.image.height || 150;
            return await this.computeImageData(img, width, height);
        } catch (error) {
			console.error('Error while trying transcode image', error);
        }
    }
}

module.exports = ImageTranscoder