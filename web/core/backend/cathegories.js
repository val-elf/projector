var core = require('./core'),
	cathModel = core.model("cathegories"),
	extend = require('extend'),
	q = require('node-promise'),
	objId = core.objectId
;


module.exports = function(app){

	return extend({}, {
		createCathegory: function(cathegory, ownerId){
			return app.getCurrentUser(true).then(function(user){
				cathegory._owner = ownerId;
				cathegory = core.normalize(cathegory, user);
				return cathModel.create(cathegory).then(function(_cathegory){
					return _cathegory._doc;
				});
			});
		},

		getOwnerCathegories: function(owner){
			return app.getCurrentUser(true).then(function(user){
				return cathModel.find({_owner: new objId(owner)}).then(function(list){
					return list;
				});
			});
		},

		updateCathegory: function(){

		}
	});
}