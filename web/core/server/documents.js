var core = require("../backend/core"),
	docs = require("../backend/documents"),
	promise = require('node-promise').Promise,
	extend = require('extend')
;

module.exports.configure = function(app){
	app.post('/owner/:owner/documents', createDocument);

	/*app.options('/mtu/tou', function(){
		this.response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000';
		this.response.headers['Access-Control-Allow-Headers'] = 'X-CSRF-Token';
		this.response.headers['Access-Control-Allow-Methods'] = 'POST';
		this.response.set({});
	});
	app.post('/mtu/tou', function(){
		this.response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000';
		this.response.set({ok: true});
	});*/
	
	app.get('/owner/:owner/documents', getOwnerDocuments);
	app.get('/owner/:owner/documents/:document', getDocument);
	app.put('/owner/:owner/documents/:document', updateDocument);
	app.delete('/owner/:owner/documents/:document', deleteDocument);
	docs = new docs(app);
}

function createDocument(key, data){
	console.log("[API] create Document", key);
	var vm = this;
	data._owner = key.owner;
	return docs.createDocument(data).then(function(doc){
		vm.response.set(doc)
	});
}

function getOwnerDocuments(key){
	console.log("[API] Get Owner Documents", key);

	var vm = this;
	return docs.getDocuments(key.owner, key._metadata).then(list => {
		list.data.forEach(function(item){
			var src = item._doc;
			if(src._file){
				extend(src.metadata, detectMediaType(src._file));
			}
		});
		this.response.set(list);
	});
}

function deleteDocument(key){
	console.log("[API] Delete Owner Document", key);
	var vm = this;
	return docs.removeDocument(key.document).then(function(){
		vm.response.set({deleted:true});
	});
}

function detectMediaType(file){
	var res = {},
		tp = file.type || file.exif && file.exif.mimeType || null;
	if(tp){
		var mt = tp.match(/^(.+?)\/(.+)$/);

		res.mediatype = mt && mt[1] || 'unknown';
		mt[2] && (res.subtype = mt[2]);
	}
	return res;
	//return 'unknown';
}

function updateDocument(key, document){
	console.log("[API] Update Document", key);
	var vm = this;
	document && delete document._file;
	return docs.updateDocument(document).then(function(resdoc){
		vm.response.set(document);
	})
}

function getDocument(key){
	console.log("[API] Get Document", key);
	return docs.getDocument(key.document).then(doc=> this.response.set(doc));
}