import { request } from "http";

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

type TParams = { [key: string]: string | number };

class Core {
	_call(url: string, method: string, data: {}, params?: TParams): Promise<any> {
		const opts = {
			...options,
			method,
		};
		let _params = "";
		if(params){
			_params = Object.keys(params)
				.map((item) => {
					if(url.indexOf(':' + item) > 0){
						url = url.replace(':' + item, params[item].toString());
						return null;
					} else return item + '=' + params[item];
				})
				.filter(item => item).join('&');
		}
		opts.path = url + (_params ? '?' + _params : '');

		opts.headers['Cookie'] = Object.keys(cookies).map(function(cookie){
			 return cookie  + '=' + cookies[cookie];
			}).join(';');

		return new Promise((resolve, reject) => {
			var req = request(opts, (res) => {
				var body = "";
				res.on('data', function(chunk){
					body += chunk && chunk.toString();
				});

				res.on('end', function(){
					resolve(JSON.parse(body));
				});
			})

			req.on("error", function(err){
				console.error("[ERR] %s %j", err, err);
				reject(err);
			});

			if(data)
				req.write(JSON.stringify(data));

			req.end();
		})
	}

	setCookie(name: string, value: string){
		cookies[name] = value;
	}

	get(url: string, data: unknown) {
		return this._call(url, 'GET', data);
	}

	post(url: string, data: unknown, params: TParams) {
		return this._call(url, 'POST', data, params);
	}

	put(url: string, data: unknown, params: TParams) {
		return this._call(url, 'PUT', data, params);
	}

	delete(url: string, data: unknown, params: TParams) {
		return this._call(url, 'DELETE', data, params);
	}
}

export const core = new Core();