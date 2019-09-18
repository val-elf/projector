var http = require('http'),
	u = require('url'),
	q = require('node-promise'),
	Readable = require('stream').Readable;

module.exports = {
	_processRequest: function(method, url, data, callback, options){
		var url = u.parse(url),
			promise = q.Promise();
		var req = http.request({
			method: method,
			host: url.hostname,
			port: url.port,
			path: url.path
		}, function(res){
			var _dt = [];
			res.on('data', function(data){
				_dt.push(data);
			});
			res.on('end', function(){
				var result = Buffer.concat(_dt);
				callback && q.all([callback(result)]).then(function(){
					promise.resolve(result);
				}, function(error){
					promise.reject(error);
				});
			})
		});
		if(options){
			if(options.headers){
				Object.keys(options.headers).forEach(function(hkey){
					req.setHeader(hkey, options.headers[hkey]);
				})
			}
		}
		var isBinary = data instanceof Buffer;
		var isStream = data instanceof Readable;
		if(!isBinary && !isStream) req.setHeader('Content-Type', 'application/json');
		if(isStream){
			data.pipe(req);
			data.on('end', function(){
				req.end();
			})
		}
		else{
			data && req.write(isBinary ? data : typeof(data) === "object" ? JSON.stringify(data) : typeof(data)==="string" ? data : Object.toString(data));
			req.end();
		}
		return promise;
	},

	get: function(url, callback) {
		return this._processRequest('GET', url, undefined, callback);
	},

	post: function(url, data, options, callback){
		return this._processRequest('POST', url, data, callback, options);
	}
}