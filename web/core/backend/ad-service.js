var extend = require('extend'),
	router = require('express').Router(),
	Request = require('./network/request'),
	Response = require('./network/response'),
	d = require('node-promise');
var service;

router._get = router.get;
router._post = router.post;
router._put = router.put;
router._delete = router.delete;
router._options = router.options;

function send(res, body, status){
	res.statusCode = status || 200;
	res.send(JSON.stringify(body));
	res.end;
}

function processRequest(req, res, next, callback, options){
	var request = new Request(options),
		response = new Response();

	bService.request = req;
	bService.response = res;

	d.when(
		request.receive(req),
		function(){
			var body = request.body ? 
				typeof(request.body) != "object" && req.headers['content-type'] === 'application/json' ? JSON.parse(request.body) : request.body
				: null,
				params = extend({}, req.params, {_metadata: req.query});

			if(request.multipart){
				extend(params, request.multipart.parsed);
			}
			args = [params];
			body && args.push(body);

			d.when(callback.apply({request: request, response: response}, args),
				function(){
					done();
				},
				function(error){
					response.setError(error);
					done();
				}
			);
			function done(){
				response.send(res);
			}
		}
	)
}

var bService = extend(router, {	

	get: function(path, callback){
		this._get(path, function(req, res, next){
			processRequest(req, res, next, callback);
		});
	},

	post: function(path, callback, options){
		this._post(path, function(req, res, next){
			processRequest(req, res, next, callback, options);
		});
	},

	put: function(path, callback){
		this._put(path, function(req, res, next){
			processRequest(req, res, next, callback);
		});
	},

	options: function(path, callback, options){
		this._options(path, function(req, res, next){
			processRequest(req, res, next, callback, options);
		})
	},	

	delete: function(path, callback){
		this._delete(path, function(req, res, next){
			processRequest(req, res, next, callback);
		});
	}
});

module.exports = bService;