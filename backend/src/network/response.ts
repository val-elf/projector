// Copyright (C) 2010-2013 Adstream Holdings
// All rights reserved.
// Redistribution and use are permitted under the modified BSD license
// available at https://github.com/MaxMotovilov/adstream-js-frameworks/wiki/License

const Buffer = require('buffer').Buffer;
const stream = require('stream');

export class Response {
	body: any;
	status: number;
	headers: any;
	cookies: any;
	error: any;

	constructor() {
		this.body = {};
		this.status = 200;
		this.headers = { 'Content-Type': 'application/json; charset=utf-8' };
		this.cookies = {};
	}

	send(resp) {
		const writeHeadOk = () => {
			resp.writeHead(
				this.error ? this.error.httpCode || 500 : this.status,
				Object.assign(
					this.headers,
					( this.error && this.error.httpHeaders ) || {}
				)
			);
		}

		if( this.error )
			this.body._error = Object.assign(
				this.body._error || {},
				{ message: this.error.message },
				this.error.content ? { content: this.error.content } : {},
				this.error.stack ? { backtrace: this.error.stack.split( /\n\s*/ ).slice(1) } : {}
			);
		Object.keys(this.cookies).forEach(function(key){
			resp.cookie(key, this.cookies[key].value, this.cookies[key].params);
		}, this);

		if(this.body instanceof stream.Readable){
			this.body.pipe(resp);
			this.body.on('error', (error) => {
				resp.writeHead(
					404
				);
				resp.end(JSON.stringify(error))
			});
		}
		else {
			writeHeadOk();
			resp.end( this.body instanceof Buffer ? this.body : JSON.stringify( this.body ) );
		}
	}

	setStatus(status) {
		this.status = status;
	}

	setError(err: Error | string, code?: number) {
		if( err ) {
			this.reset();
			this.error = err;
			if(code) this.error.httpCode = code;
		} else delete this.error;
	}

	reset() {
		this.body = {};
	}

	_fail( code, msg, headers ) {
		if( msg && typeof msg === "object" )
			return Object.assign( new Error( msg.message ), { content: msg, httpCode: code }, headers ? { httpHeaders: headers } : {} );
		else
			return Object.assign( new Error( msg ), { httpCode: code }, headers ? { httpHeaders: headers } : {} );
	}

	fail( a, b, c, d ) {
		if( a.reject )	a.reject( this._fail( b, c, d ) );
		else throw this._fail( a, b, c );
	}

	set( val ) {
		var result;
		if(val instanceof Array) this.body = [];
		if(val instanceof Buffer){
			this.body = val;
			result = this.body;
		}
		else if(val instanceof stream.Readable){
			this.body = val;
			result = this.body;
		} else
			result = Object.assign(this.body, val );
		return result;
	}

	setStream(stream){
		this.body = stream;
	}

	setHeader( name, value ) {
		this.headers[name] = value;
	}
}
