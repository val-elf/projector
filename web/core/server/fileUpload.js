var extend = require("extend"),
	fs = require("fs"),
	http = require("../utils/simpleHttp"),
	config = require('../config'),
	Promise = require('node-promise').Promise,
	fileUploader = require("../backend/file-upload.js")
;
module.exports.configure = function(app){
	app.post('/fileUpload', fileUpload, {streamable: true});
	app.get('/fileInfo/:file', getFileInfo);
	app.get('/file/:file', downloadFile);
	app.get('/owner/:owner/files', getOwnerFiles);
	app.post('/exif-results/', updateExifInfo);
	app.post('/transcode-results/', updatePreviewInfo, {streamable: true});
	fileUploader = new fileUploader(app);
}

function fileUpload(key, data){
	console.log("[API] Upload the file", key);
	var vm = this,
		prm = Promise()
	;
	data.on('header', function(header){
		var fileInfo = {
			_owner: key._metadata.owner,
			name: header.parsed.filename,
			file: header.parsed.filename,
			type: header.parsed['content-type']
		};

		fileUploader.createFile(fileInfo).then(function(file){
			var wrt = fs.createWriteStream("./storage/" + file._id);
			data.pipe(wrt);
			data.on('end', function(){
				wrt.end();
				file.size = data._size;
				var _sessionId = vm.request.cookies["_session"],
					readFileStream = fs.createReadStream('./storage/' + file._id);
				vm.response.set(file);
				prm.resolve();
				console.log("Saving end", file);
				http.post(config.transcoder + '?session=' + _sessionId + '&callback=' + config.myip + ':' + config.port, readFileStream, {}, function(result){
					var res = JSON.parse(result.toString());
					if(res.done){
						file._transcode = res.id;
						fileUploader.updateFile(file);
						console.log("Sending to transcoding is finished");
					}
				});

			});
		});

	});
	return prm;
}

function getFileInfo(key){

}

function updateExifInfo(key, data){
	console.log("[API] Update exif file info", key);
	var vm = this,
		session = key._metadata.session;
	this.request.cookies['_session'] = session;
	return fileUploader.getFileByTranscode(data.id).then(function(file){
		file.exif = extend({}, data);
		return fileUploader.updateFile(file).then(function(file){
			vm.response.set({ok: true});
		})
	})
}

function updatePreviewInfo(key, data){
	console.log("[API] Update transcoding info for file", key);
	var vm = this,
		type = key._metadata.thumbnail ? 'thumbnail' : 'preview',
		itemId = key._metadata.id,
		session = key._metadata.session,
		prms = Promise();
	this.request.cookies['_session'] = session;

	if(type === 'thumbnail'){
		var strm = [];
		data.on('data', function(chunk){
			strm.push(chunk);
		});
		data.on('end', function(){
			var thumbnail = new Buffer.concat(strm).toString('base64'),
				contentType  = vm.request.headers['content-type'];
			fileUploader.updateFileByTranscode(itemId, {
				preview: {
					preview: thumbnail,
					type: contentType
				}
			}).then(function(file){
				vm.response.set({done: true});
				prms.resolve();
			});
		});
	} else {
		var filestore = fs.createWriteStream('./storage/transcoded/' + itemId);
		data.pipe(filestore);
		data.on('end', function(){
			filestore.end();
			fileUploader.updateFileByTranscode(itemId, {
				_preview: itemId
			})
			vm.response.set({done: true});
			prms.resolve()
		});
	}
	return  prms;
}

function downloadFile(key){
	console.log("[API] Download file", key);
	var vm = this,
		isTranscoded = key._metadata.transcoded;
	return fileUploader.getFileInfo(key.file).then(function(fileInfo){
		var contentType = isTranscoded ? 
			(fileInfo.type.match(/^video\//) ? 'video/ogg' : 'text/html')
			: fileInfo.type || 'application/json'
		;
		vm.response.headers['Content-Type'] = contentType;
		vm.response.headers['Content-Disposition'] = '; filename=' + fileInfo.file;
		var fname = "storage/" + (key._metadata.transcoded ? 'transcoded/' : '') + (key._metadata.transcoded ? fileInfo._preview: key.file)
		var fstream = fs.createReadStream(fname);
		vm.response.setStream(fstream);
	})
}

function getOwnerFiles(key){
	console.log("[API] Get owner files", key);
	var vm = this;
	return fileUploader.getOwnerFiles(key.owner).then(function(files){
		vm.response.set(files);
	});
}