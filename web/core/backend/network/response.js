// Copyright (C) 2010-2013 Adstream Holdings
// All rights reserved.
// Redistribution and use are permitted under the modified BSD license
// available at https://github.com/MaxMotovilov/adstream-js-frameworks/wiki/License

var d = require( './lang.js' ),
	packet = require( './packet.js' )
	Buffer = require('buffer').Buffer,
	stream = require('stream')
;

exports = module.exports = d.extend(
	function() {
		this.body = {};
		this.headers = {
			'Content-Type': 'application/json; charset=utf-8' 
		};
	}, {
		cookies: {},
		send: function( resp ) {
			if( this.error )
				this.body._error = d.mixin(
					this.body._error || {},
					{ message: this.error.message },
					this.error.content ? { content: this.error.content } : {},
					this.error.stack ? { backtrace: this.error.stack.split( /\n\s*/ ).slice(1) } : {}
				);
			Object.keys(this.cookies).forEach(function(key){
				resp.cookie(key, this.cookies[key]);
			}, this);
	
			resp.writeHead(
				this.error ? this.error.httpCode || 500 : 200,
				d.mixin( 
					this.headers,
					( this.error && this.error.httpHeaders ) || {}
				)
			);
			if(this.body instanceof stream.Readable){
				this.body.pipe(resp);
			}
			else resp.end( this.body instanceof Buffer ? this.body : JSON.stringify( this.body ) );
		},

		setError: function( err, code ) {
			if( err ) {
				this.reset();
				this.error = err;
				if(code) this.error.httpCode = code;
			} else delete this.error;
		},		

		reset: function() {
			this.body = {};
		},

		_fail: function( code, msg, headers ) {
			if( msg && typeof msg === "object" )
				return d.mixin( new Error( msg.message ), { content: msg, httpCode: code }, headers ? { httpHeaders: headers } : {} );
			else
				return d.mixin( new Error( msg ), { httpCode: code }, headers ? { httpHeaders: headers } : {} );
		},

		fail: function( a, b, c, d ) {
			if( a.reject )	a.reject( this._fail( b, c, d ) );
			else			throw this._fail( a, b, c );
		},

		set: function( val ) {	
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
				result = d.mixin(this.body, val );
			return result;
		},

		setStream: function(stream){
			this.body = stream;
		},

		setHeader: function( name, value ) {
			this.headers[name] = value;
		}
	}
);
