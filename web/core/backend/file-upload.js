var core = require('./core'),
	fuModel = core.model('files'),
	extend = require('extend')
;

module.exports = function(app){
	return extend({}, {
		createFile: function(fileInfo){
			return app.getCurrentUser().then(function(user){
				fileInfo = core.normalize(fileInfo, user);
				return fuModel.create(fileInfo).then(function(_file){
					return _file._doc;
				});
			});
		},

		updateFile: function(fileInfo) {
			return app.getCurrentUser().then(function(user){
				fileInfo = core.normalize(fileInfo, user);
				return fuModel.updateItem(fileInfo).then(function(updated){
					return updated._doc;
				});
			})
		},

		updateFileByTranscode: function(transcodeId, file){
			return app.getCurrentUser().then(function(user){
				return fuModel.update(core.fixIds({_transcode: transcodeId}), file).then(function(updated){
					return updated._doc;
				});
			})
		},

		getFileByTranscode: function(transcodeId) {
			return app.getCurrentUser().then(function(user){
				return fuModel.find(core.fixIds({_transcode:transcodeId})).then(function(file){
					return file[0]._doc;
				})
			})
		},

		getFileInfo: function(file){
			return app.getCurrentUser().then(function(user){
				return fuModel.find({_id: file}).then(function(_file) {
					return _file[0]._doc;
				});
			});
		},

		getOwnerFiles: function(owner){
			return app.getCurrentUser().then(function(user){
				return fuModel.find({_owner: owner}).then(function(files){
					return files;
				});
			});
		}
	});
}