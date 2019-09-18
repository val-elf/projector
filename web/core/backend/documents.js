var core = require("./core"),
	doc = core.model("documents"),
	files = core.model("files")
;

module.exports = function(app){
	return {
		createDocument: function(docum){
			return app.getCurrentUser().then(function(user){
				docum = core.normalize(docum, user);
				return doc.create(docum).then(function(_doc){
					return _doc;
				});
			});
		},

		getDocuments: function(owner, metadata){
			return app.getCurrentUser().then(function(user){
				return doc.findList(core.fixIds({_owner: owner}), metadata).then(function(list){
					//get files if its consists
					var ids = list.data.map(function(item){ return item._id;});

					return files.find({_owner: {$in : ids} }).then(function(filesList){
						var fl = filesList.reduce(function(res, item){
							res[item._doc._owner] = item; return res; 
						}, {});
						list.data.forEach(function(doc){
							var _doc = doc._doc;
							if(fl[_doc._id]){
								_doc._file = fl[_doc._id]._doc;
								if(!_doc.metadata.type && _doc._file.exif){
									_doc.metadata.type = _doc._file.exif.mimeType;
									_doc._file.type = _doc._file.exif.mimeType;
								}
							}
						});
						return list;
					})
				});
			})
		},

		getDocument: function(documentId){
			return app.getCurrentUser().then( user => {
				return doc.find({_id: documentId}).then(docs => {
					return docs[0]._doc
				});
			});
		},

		updateDocument: function(document){
			return app.getCurrentUser().then(function(user){
				document = core.normalize(document, user);
				return doc.updateItem(document).then(function(resdoc){
					return resdoc._doc;
				});
			})
		},

		removeDocument: function(docId){
			return app.getCurrentUser().then(function(user){
				return doc.deleteItem(docId, user);
			});
		}
	}
}