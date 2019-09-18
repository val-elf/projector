var core = require('./core'),
	artModel = core.model('artifacts')
;

module.exports = function(app){
	return {
		getArtifactsList: function(projectId, metadata){
			return app.getCurrentUser().then(function(user){
				return artModel.findList(core.fixIds({_project: projectId}), metadata).then(function(list){
					return list;
				})
			})
		},

		createArtifact: function(item) {
			return app.getCurrentUser().then(function(user){
				item = core.normalize(item, user);
				return artModel.create(item).then(function(created){
					return created._doc;
				});
			});
		},

		getArtifact: function(artifactId) {
			return app.getCurrentUser().then(function(user){
				return artModel.find({_id: artifactId}).then(function(list){
					return list[0]._doc;
				})
			})
		},

		updateArtifact: function(item) {
			return app.getCurrentUser().then(function(user){
				item = core.normalize(item, user);
				return artModel.updateItem(item).then(function(updated){
					return updated._doc;
				})
			})
		},

		deleteArtifact: function(itemId) {
			return app.getCurrentUser().then(function(user){
				return artModel.deleteItem(itemId, user);
			})
		}
	}
}