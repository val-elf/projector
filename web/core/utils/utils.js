var q = require("node-promise")
;


module.exports = {
	preparePreview: function(preview){
		var prm = new q.Promise()
		if(preview && preview.preview){
			var Jimp = require('jimp'),
				Buffer = require('buffer').Buffer
			;
			var content = new Buffer(preview.preview, 'base64');
			Jimp.read(content, function(err, img){
				//var res = new Buffer();
				if(img.bitmap.width > 74) {
					var height = Math.floor(img.bitmap.height / img.bitmap.width * 74);
					img
						.resize(74, height)
						.getBuffer(Jimp.MIME_PNG, function(err, buff){
							preview.preview = buff.toString('base64');
							preview.width = img.bitmap.width;
							preview.height = img.bitmap.height;

							prm.resolve(preview);
						})
					;
				} else {
					if(!preview.width || !preview.height){
						preview.width = img.bitmap.width;
						preview.height = img.bitmap.height;
					}
					prm.resolve(preview);
				}
			});
		} else prm.resolve(preview);
		return prm;

	}
}