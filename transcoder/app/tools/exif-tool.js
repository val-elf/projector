const exif = require('../utils/exiftool');
const process = require('process');

process.on('uncaughtException', function(data){
	console.error(data.stack);
});

module.exports = {
	getMetadata: source => {
		return exif.metadata(source);
	}
}
