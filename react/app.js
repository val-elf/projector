const express = require('express');
const httpProxy = require('http-proxy');
const webpack = require("webpack");
const fs = require('fs');
const path = require('path');
const config = require('./config');
const app = express();
const isDev = process.env.NODE_ENV === 'development' || process.argv.indexOf('--dev') > 0;
const isDist = process.argv.indexOf('--dist');
const wpconfig = require('./webpack.config.dev');
const compiler = webpack(wpconfig);
let middleware = null;

const from = `/${config.apiUrl}`;
const proxy = httpProxy.createProxyServer({ });

app.use(from, (req, res) => {
	proxy.web(req, res, { target: config.backApi });
});

if (isDev) {
	middleware = require('webpack-dev-middleware')(compiler, {
		noInfo: true,
		publicPath: wpconfig.output.publicPath
	});
	app.use(middleware);
	app.use(require('webpack-hot-middleware')(compiler));
}

function prepareUrl(surl){
	var up = path.parse(surl);
	if(!up.ext){
		surl += (surl[surl.length - 1] != '/' ? '/': '') + "index.html";
	}
	return surl;
}

function start(){
	//read the local config

	console.log("Development mode:", isDev);

	process.on('uncaughtException', function(err){
		console.log("EXP unhandled", err);
	});

	var ncache = {};
	if (isDev || isDist) {
		app.route('/*') //in Dev mode app routes all another application requests
			.get((req, res, next) => {
				//prepare url;
				let rurl = req.url;
				if (rurl.match(/^\/static\//)) rurl = rurl.replace(/\/static\//, '/dist/');

				var url = prepareUrl(rurl);


				var _path = config.staticPath + url,
					_pathApp = config.applicationPath + url,
					up = path.parse(req.url),
					working = fs.existsSync(_path) && _path || fs.existsSync(_pathApp) && _pathApp || null
				;

				console.log("[%s][%s] %s:%s", new Date(), req.connection.remoteAddress, req.method, url);

				//first, check is this dynamic url?
				if(!up.ext) {
					req.url = '/index.html';
					return middleware(req, res, next);
				}

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
	}

	app.listen(config.port);
}

start();
