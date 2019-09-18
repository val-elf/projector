// Copyright (C) 2010-2012 Adstream Holdings
// All rights reserved.
// Redistribution and use are permitted under the modified BSD license
// available at https://github.com/MaxMotovilov/adstream-js-frameworks/wiki/License

var d = require( './lang.js' ),
	packet = require( './packet.js' ),
	Buffer = require('buffer').Buffer,
//	fs = require('fs'),
	stream = require('stream'),
	Transform = stream.Transform
;

d.mixin( d, require( 'node-promise' ) );

exports = module.exports = d.extend(
	function(options) {
		this.options = d.mixin({}, options || {});
	}, 
	{
		cookies: {},
		receive: function( req ) {
			this.cookies = req.cookies;
			this.session = req.session;
			this.headers = req.headers;
			var u = require( 'url' ).parse( req.url, true ),
				ctype = this.getContentType(req)
			;
			this.boundary = ctype === 'multipart/form-data' ? this.getBoundary(req) : null;

			this.method = req.method;
			this.url = u.pathname.substring( 1 );
			this.args = d.mixin( {}, this.origArgs = u.query );

			if(!this.boundary && !this.options.streamable) req.setEncoding( 'utf8' );
			if(this.options.streamable){
				return this._streamReceive(req);
			} else {
				return this._basicReceive(req, ctype);
			}

		},

		_streamReceive: function(req){
			var vm = this;
			if(this.boundary){
				var _chunk = 0,
					finBoundary = '\r\n--' + this.boundary + '--\r\n'
				;

				this.body = new Transform({
					transform: function(chunk, encoding, callback){	
						if(!_chunk) {
							chunk = vm._processFirstBoundaryChunk(chunk, this);
							this.emit('header', vm.multipart);
						}
						var ind = chunk.length - vm.boundary.length - 8,
							bnd = chunk.slice(ind).toString('ascii')
						;							
						if(bnd === finBoundary)
							chunk = chunk.slice(0, ind);
						_chunk ++;
						this._size += chunk.length;
						this.push(chunk);
						callback();
					}
				});
				req.pipe(this.body);
				this.body._size = 0;
			} else 
				this.body = req;			
			return true;
		},

		_processFirstBoundaryChunk: function(chunk){
			var src = chunk.toString('ascii');
			if(src.indexOf('--' + this.boundary) === 0){
				//read the header of multipart data
				this.multipart = {};
				var cstart = src.indexOf('\r\n\r\n'),
					header = chunk.slice(0, cstart).toString('utf8')
				;
				this.prepareMultipartHeaders(this.multipart, header);
				chunk = chunk.slice(cstart + 4);
			}
			return chunk;
		},

		_basicReceive: function(req, ctype){
			var res = new d.Deferred(),
				data = [],
				sum = 0,
				hlength = 0,
				cl = 0
			;

			req.on( 'data', (function(chunk){
				cl += chunk.length;
				if(this.boundary){
					var src = chunk.toString('ascii');
					if(data.length === 0) {
						if(src.indexOf('--' + this.boundary) === 0){
							//read the header of multipart data
							this.multipart = {};
							var cstart = src.indexOf('\r\n\r\n'), header = chunk.slice(0, cstart).toString('utf8');
							hlength += header.length + 4;
							this.prepareMultipartHeaders(this.multipart, header);
							chunk = chunk.slice(cstart + 4);
						} else {
							res.reject( d.mixin( 
								new Error( 'Invalid content of multipart/form-data' ),
								{ httpCode: 400 }
							) );						
						}
					}
					var ind = chunk.length - this.boundary.length - 8;
					if(src.substring(src.length - this.boundary.length - 8) === '\r\n--' + this.boundary + '--\r\n') {
						//last chunk
						chunk = chunk.slice(0, ind);
						hlength += this.boundary.length + 8;
					}
					sum += chunk.length;
				}
				data.push( chunk );
			} ).bind(this));
			req.on( 'end', d.hitch( this, function() {
				if(this.boundary)
					data = Buffer.concat(data);
				this.build( res, req, ctype !== 'multipart/form-data' ? data.join('') : data );
			} ) );
			return res;
		},

		prepareMultipartHeaders: function(dest, source){
			var pts = source.split(/\r\n/);
			pts.forEach(function(item, index){
				var ipts = item.split(/\s*;\s*/);
				if(!index) return;
				var hnpts = ipts[0].split(/:/), itm = { value: hnpts[1].trim() };
				dest[hnpts[0]] = itm;
				ipts.forEach(function(iptitem, _index){
					if(!_index) return;
					var pnp = iptitem.split(/=/);
					itm[pnp[0]] = pnp[1].replace(/(^\"|\"$)/g,'').trim();
				});
			});

			dest.parsed = {
				filename: dest['Content-Disposition'] && dest['Content-Disposition'].filename,
				name: dest['Content-Disposition'] && dest['Content-Disposition'].name,
				'content-type': dest['Content-Type'] && dest['Content-Type'].value
			}			
		},

		getBoundary: function(req) {
			var res = (req.headers['content-type'] || '').split(/\s*;\s*/),
				value;
			res.some(function(item){
				if(item.indexOf('boundary=') === 0){
					value = item.substring('boundary='.length);
					return true;
				}
			});
			return value;
		},

		getContentType: function(req){
			return (req.headers['content-type'] || '').split( /\s*;\s*/ )[0];
		},

		build: function( res, req, body ) {
			var ctype = this.getContentType(req);

			if(this.boundary) ctype = 'application/octets';
			if( body && ctype !== 'application/json' && ctype !== 'application/octets' && ctype !== 'application/x-www-form-urlencoded')
				res.reject( d.mixin( 
					new Error( 'Invalid content type in HTTP request, expected application/json' ),
					{ httpCode: 400 }
				) );
			else try { 
				this.body = 
					ctype === 'application/json' && body && JSON.parse( body ) || 
					ctype === 'application/octets' && body || 
					ctype === 'application/x-www-form-urlencoded' && decodeURIComponent(body) ||
					{};
				this.headers = req.headers;
				res.resolve( false );
			} catch( e ) {
				res.reject( d.mixin(
					new Error( 'Malformed request body: ' + e.message ),
					{ httpCode: 400 }
				) );
			}
		},

		get: function( rel, meta ) {
			if( meta )	meta = collectMeta( meta, this.args, rel.replace( /.*[\/]/, '' ) );
			var res = packet.get( this.body, rel, meta );
			if( meta )
				if( res._ )	d.mixin( res._, mixinChildren( meta, res._ ) );
				else		res._ = meta;
			return res;
		},

		arg: function( arg_name ) {
			var result = null;
			if( arg_name in this.args ) {
				result = this.args[arg_name];
				delete this.args[arg_name];
			}
			return result;
		}
	}
);

function mixinChildren( to, from ) {
	for( var f in from )
		if( f in to )
			if( typeof from[f] === 'object' && typeof to[f] === 'object' )
				d.mixin( to[f], from[f] );
			else to[f] = from[f];
}

function collectMeta( tpl, args, id ) {
	var sub, res;

	function result() {
		if( !res )	res = {};
		return res;
	}

	function arg( f ) {
		var q = id + '.' + f;
		if( q in args )
			f = q;

		var r = args[f];
		if( f in args )	delete args[f];
		return r;
	}

	for( var f in tpl )
		if( tpl.hasOwnProperty(f) )
			switch( typeof tpl[f] ) {
				case 'undefined':
				case 'object':
					if( tpl[f] ) {
						if( sub = collectMeta( tpl[f], args ) )
							result()[f] = sub;
					} else if( f in args ) {
						result()[f] = arg( f );
					}
					break;
				case 'string':
					result()[f] = f in args ? arg( f ) : tpl[f];
					break;
				case 'number':
					if( f in args ) {
						if( Number.isNaN( sub = Number( arg( f ) ) ) )						
							throw d.mixin(
								new Error( 'Query argument ' + f + '=' + args[f] + ' is not a number' ),
								{ httpCode: 400 }
							);
					} else sub = tpl[f];

					if( !Number.isNaN( sub ) )	result()[f] = sub;
					break;
				case 'boolean':
					if( f in args )
						result()[f] = !( arg( f ).toLowerCase() in { '': 1, '0': 1, 'false': 1, 'no': 1, 'n': 1 } );
					else
						result()[f] = tpl[f];
					break;
				case 'function':
					if( typeof (sub = tpl[f]( arg( f ) )) !== 'undefined' )
						result()[f] = sub;
					break;
			}

	return res;
}

