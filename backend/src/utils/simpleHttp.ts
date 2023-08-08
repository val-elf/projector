import _http from "http";
import Url from "url";
import { Readable } from "stream";

class Http {
	async _processRequest(
		method: string,
		url: string,
		data: any,
		callback: (...args: any[]) => any,
		options?: any
	): Promise<any> {
		return new Promise((resolve, reject) => {
			const parsedUrl = Url.parse(url);
			const req = _http.request({
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
				data && req.write(isBinary ? data : typeof(data) === "object" ? JSON.stringify(data) : typeof(data)==="string" ? data : Object.toString.call(data));
				req.end();
			}
		});
	}

	get(url: string, callback?: (...args: any[]) => void) {
		return this._processRequest('GET', url, undefined, callback);
	}

	post(url: string, data: any, options?: any, callback?: (...args: any[]) => void) {
		return this._processRequest('POST', url, data, callback, options);
	}

	put(url: string, data: any, options?: any, callback?: (...args: any[]) => void) {
		return this._processRequest('PUT', url, data, callback, options);
	}
}

export const http = new Http();