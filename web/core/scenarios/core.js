var http = require("http"),
	extend = require("extend")
	q = require("node-promise")
;



var options = {
	host: 'localhost',
	port: '7000',
	path: '',
	method: 'POST',
	headers: {
		'Content-Type':'application/json'
	}
},
	cookies = {};

module.exports = {

	"_call": function(url, method, params, data){
		var opts = extend({}, options, {
			method: method
		}), _params = "";
		if(params){
			_params = Object.keys(params).map(function(item){
				if(url.indexOf(':' + item)>0){
					url = url.replace(':' + item, params[item]);
					return null;
				} else return item + '=' + params[item];
			}).filter( function(item){return item != null;}).join('&');
			
		}
		opts.path = url + (_params ? '?' + _params : '');

		opts.headers['Cookie'] = Object.keys(cookies).map(function(cookie){
			 return cookie  + '=' + cookies[cookie];
			}).join(';');

		var dfr = q.defer();
		var req = http.request(opts, function(res){
			var body = "";
			res.on('data', function(chunk){
				body += chunk && chunk.toString();
			});

			res.on('end', function(){
				console.log("Call ", opts.method, opts.path, " - done");
				dfr.resolve(JSON.parse(body));
			});


		}, function(err){
			conosle.error("[ERR] %s %j", err, err);
			dfr.reject(err);
		});

		if(data)
			req.write(JSON.stringify(data));

		req.end();
		console.log("Sending ", opts.host + opts.path);
		return dfr.promise;
	},

	setCookie: function(name, value){
		cookies[name] = value;
	},

	"get": function(url, data){
		return this._call(url, 'GET', data);
	},
	"post": function(url, params, data){
		return this._call(url, 'POST', params, data);
	},
	"put": function(url, params, data){
		return this._call(url, 'PUT', params, data);
	},
	"delete": function(url, params, data){
		return this._call(url, 'DELETE', params, data);
	}
}