var core = require('./core'),
	tsModel = core.model('timespots'),
	extend = require('extend')
;

module.exports = function(app){
	return extend({}, {
		update: function(timespot){
			return app.getCurrentUser(true).then(function(user){
				timespot = core.normalize(timespot, user);
				timespot.$unset = {}
				if(timespot.startDate === null){
					delete timespot.startDate;
					timespot.$unset.startDate = "";
				}
				if(timespot.endOffsetX === null){
					delete timespot.endOffsetX;
					timespot.$unset.endOffsetX = "";
				}
				if(timespot.endDate === null){
					delete timespot.endDate;
					timespot.$unset.endDate = "";
				}
				if(!Object.keys(timespot.$unset).length) delete timespot.$unset;
				return tsModel.updateItem(timespot).then(function(_timespot){
					return _timespot._doc;
				})
			});
		},
		createTimespot: function(timespot){
			return app.getCurrentUser(true).then(function(user){
				timespot = core.normalize(timespot, user);
				return tsModel.create(timespot).then(function(_timespot){
					return _timespot;
				});
			});
		},
		deleteTimespot: function(timespotId){
			return app.getCurrentUser(true).then(function(user){
				core.deleteItem(tsModel, timespotId, user);
			})
		}
	});
}