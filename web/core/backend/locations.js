var core = require('./core'),
	locModel = core.model('locations')
;

module.exports = function(app){
	return {
		getLocationsList: function(projectId, metadata){
			return app.getCurrentUser().then(function(user){
				if(metadata.orderByType && metadata.orderByType.length){
					return locModel.eval(function(projectId, orderByType){
						return db.locations.find({
							_project: ObjectId(projectId),
							_deleted: {$exists: false}
						}).map(function(item){
							item._loctype = orderByType.indexOf(item.locationType);
							if(item._loctype === -1) item._loctype = 1000;
							return item;
						}).sort(function(i1, i2){							
							return i1._loctype - i2._loctype;
						});
					}, [projectId, metadata.orderByType]);
				}
				return locModel.findList(core.fixIds({_project: projectId}), metadata).then(function(list){
					return list;
				})
			})
		},

		getLocationItem: function(locationId){
			return app.getCurrentUser().then(function(user){
				return locModel.find({_id: locationId}).then(function(list){
					return list[0]._doc;
				});
			});
		},

		createLocation: function(item) {
			return app.getCurrentUser().then(function(user){
				item = core.normalize(item, user);
				return locModel.create(item).then(function(created){
					return created._doc;
				});
			});
		},

		updateLocation: function(item) {
			return app.getCurrentUser().then(function(user){
				item = core.normalize(item, user);
				return locModel.updateItem(item).then(function(updated){
					return updated._doc;
				})
			})
		},

		deleteLocation: function(itemId) {
			return app.getCurrentUser().then(function(user){
				return locModel.deleteItem(itemId, user);
			})
		}
	}
}