import * as express from "express";
import * as Cluster from "cluster";
import * as session from "express-session";
import * as cookieParser from "cookie-parser";
import * as fs from "fs";
import { config } from "./config";
import { service as beService } from "./network/service";

const cluster = Cluster as unknown as Cluster.Cluster;

const app = express();
const isDev = process.env.NODE_ENV === 'development' || process.argv.indexOf('--dev') > 0;
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
	console.log("starting the development mode")
	prepareInfrastructure();

	console.log('Development mode:', isDev);
	process.on('uncaughtException', function(err){
		console.log('EXP unhandled', err);
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

if (cluster.isPrimary) {
	start();
} else {
	runExpress();
}