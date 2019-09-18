var express = require("express"),
	session = require("express-session"),
	cookieParser = require("cookie-parser"),
	fs = require('fs'),
	url = require('url'),
	path = require('path'),
	cproc = require('child_process'),
	exec = cproc.exec,
	spawn = cproc.spawn,
	config = require('./config'),
	beService = require('./backend/ad-service'),
	d = require('./backend/network/lang')
	app = express(),
	isDev = process.env.NODE_ENV === 'development' || process.argv.indexOf('--dev') > 0;
	noGrunt = process.argv.indexOf('--no-grunt') > 0;

	app.use(cookieParser());


function prepareUrl(surl){
	var up = path.parse(surl);
	if(!up.ext){
		surl += (surl[surl.length - 1] != '/' ? '/': '') + "index.html";
	}
	return surl;
}

function start(){
	//read the local config

	app.use(session({
		secret: 'projector periskopen',
		resave: false,
		saveUninitialized: false,
		cookie: {secure: !isDev}
	}));

	if(fs.existsSync('./config.local.js')){
		try{
			var _cnf = fs.readFileSync('./config.local.js').toString();
			eval('_cnf = ' + _cnf + ';');
			d.mixin(config, _cnf);
		} catch(exp){
			console.log("[LocalConfigError]", exp.stack);
		}
	}
	console.log("Development mode:", isDev, (noGrunt ? ', no grunt' : ''));

	if(isDev) {
		//trancoder run
		var transcoderProc = exec('node ../transcoder/transcoder.js', {
			cwd: '../transcoder'
		});
		transcoderProc.stdout.on('data', function(data){
			process.stdout.write("[Transcode]:" + data.toString());
		})
	}

	process.on('uncaughtException', function(err){
		console.log("EXP unhandled", err);
		//process.exit();
		//gruntProc.kill('SIGINT');
	});

	if(!noGrunt){
		var gruntProc = exec('grunt' + (isDev ? ' dev' : ''), {
			detached: true
		});

		gruntProc.stdout.on('data', function(data){
			process.stdout.write("[Grunt]:" + data.toString());
		})
		gruntProc.on('error', function(error){
			console.log("[proc]", error);
		});
	}
	fs.readdirSync(config.apiFolder).forEach(function(item){
		try{
			var module = require(config.apiFolder + '/' + item);
			module && module.configure && module.configure(beService);
		} catch( exception ){
			console.error("Exception in module " + item + "\n", exception.stack);
		}
	});
	app.use(config.apiPath, beService);

	var ncache = {};

	app.route('/*')
		.get(function(req, res, next){
			//prepare url;
			var url = prepareUrl(req.url),
				_path = config.staticPath + url,
				_pathApp = config.applicationPath + url,
				up = path.parse(req.url),
				working = fs.existsSync(_path) && _path || fs.existsSync(_pathApp) && _pathApp || null
			;



			console.log("[%s][%s] %s:%s", new Date(), req.connection.remoteAddress, req.method, req.url);

			//first, check is this dynamic url?
			if(!up.ext && config.dynamicUrls && config.dynamicUrls.some(function(durl){
					return req.url.indexOf(durl) === 0;
				})
			) working = config.staticPath + "/index.html";

			if(working){
				up = path.parse(working);
				var fstat = fs.statSync(working), mtm = ncache[working] && Math.floor(ncache[working].mtime.getTime()/1000) || 0;
				var _isIfMod = req.get('If-Modified-Since');
				var isIfMod = _isIfMod && new Date(_isIfMod).getTime()/1000 || isIfMod;

				if(config.cachableContent && isIfMod && fstat && Math.floor(fstat.mtime.getTime()/1000) === mtm && isIfMod >= mtm){
					res.sendStatus(304);
				} else {

					var content = fs.readFileSync(working),
						ct;

					switch(up.ext.toLowerCase()){
						case ".png":
						case ".jpg":
						case ".gif":
							ct = "image/" + up.ext.substring(1).toLowerCase();
						break;
						case ".js": ct = "text/js; charset=UTF-8";break;
						case ".html": ct = "text/html; charset=UTF-8"; break;
						case ".css": ct = "text/css; charset=UTF-8"; break;
					}
					ct && res.setHeader('Content-Type', ct);
					ncache[working] = fstat;
					if(config.cachableContent) res.setHeader('Last-Modified', fstat.mtime);
					res.end(content)
				}
			} else {
				res.sendStatus(404);
			}
		});

	app.listen(config.port, config.host || "[::]");
}

start();
return;