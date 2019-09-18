var express = require("express"),
	cluster = require('cluster'),
	session = require("express-session"),
	cookieParser = require("cookie-parser"),
	fs = require('fs'),
	// path = require('path'),
	config = require('./config'),
	beService = require('./backend/ad-service'),
	app = express(),
	isDev = process.env.NODE_ENV === 'development' || process.argv.indexOf('--dev') > 0
;

app.use(cookieParser());

function prepareInfrastructure() {
	['storage'].forEach(folder => {
		if (!fs.existsSync(`./${folder}`)) {
			fs.mkdirSync(`./${folder}`);
		}
	});
}

function start(){
	//read the local config
	prepareInfrastructure();

	console.log("Development mode:", isDev);

	process.on('uncaughtException', function(err){
		console.log("EXP unhandled", err);
	});

	for(var i = 0; i < 3; i++) {
		cluster.fork();
	}
}

function runExpress() {
	app.use(session({
		secret: 'projector periskopen',
		resave: false,
		saveUninitialized: false,
		cookie: {secure: !isDev}
	}));
	beService.init(app, config);
	app.listen(config.port);
}

if (cluster.isMaster) {
	start();
} else {
	runExpress();
}