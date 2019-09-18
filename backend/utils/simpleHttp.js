var http = require('http'),
	u = require('url'),
	Readable = require('stream').Readable;

module.exports = {
	_processRequest: function(method, url, data, callback, options){
		return new Promise((resolve, reject) => {
			const parsedUrl = u.parse(url);
			const req = http.request({
					method: method,
					host: parsedUrl.hostname,
					port: parsedUrl.port,
					path: parsedUrl.path
				},
				res => {
					var _dt = [];
					res.on('data', function(data){
						_dt.push(data);
					});
					res.on('end', function(){
						var result = Buffer.concat(_dt);
						if (callback) {
							Promise.all([callback(result)]).then(_ => resolve(result),
							error => reject(error));
						} else resolve(result);
					})
				}
			).on('error', error => {
				reject(error);
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
		});
	},

	get: function(url, callback) {
		return this._processRequest('GET', url, undefined, callback);
	},

	post: function(url, data, options, callback) {
		return this._processRequest('POST', url, data, callback, options);
	},

	put: function(url, data, options, callback) {
		return this._processRequest('PUT', url, data, callback, options);
	}
}