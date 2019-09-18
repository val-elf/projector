var core = require('./core'),
	charModel = core.model('characters'),
	extend = require('extend');


module.exports = function(app){
	return extend({}, {
		createCharacter: function(character){
			return app.getCurrentUser().then(function(user){
				character = core.normalize(character, user);
				return charModel.create(character).then(function(_character){
					return _character._doc;
				});
			});
		},

		updateCharacter: function(character){
			return app.getCurrentUser().then(function(user){
				character = core.normalize(character, user);
				return charModel.updateItem(character).then(function(_character){
					return _character._doc;
				})
			});
		},

		deleteCharacter: function(charId){
			return app.getCurrentUser().then( user => {
				return charModel.deleteItem(charId, user);
			});
		},

		getCharacters: function(project, metadata){
			var meta = core.prepareMetadata(metadata, {
				sort: {'_update._dt': -1, '_create._dt': -1}
			});

			return app.getCurrentUser().then(function(user){
				var prms = core.fixIds(extend({'_create._user': user._id}, project));
				if(metadata._id){
					if(!(metadata._id instanceof Array)) metadata._id = [metadata._id];
					prms._id = {$in: metadata._id.map(function(item){
						if(item === 'undefined') return undefined;
						return item;
					})};
				}
				return charModel.findList(prms, meta).then(function(charList){
					return charList;
				});
			})
		},

		getCharactersCountFor: function(projectId) {
			return app.getCurrentUser().then(function(user){
				var prms = core.fixIds({'_create._user': user._id, _project: projectId});
				return charModel.getCountOf(prms).then(function(count){
					return count;
				});
			});
		},

		getCharacter: function(charId){
			if(!charId) throw new Error("Character id must be defined");
			return charModel.find({_id: charId}).then(function(chars){
				return chars[0]._doc;
			})
		}
	})
}
