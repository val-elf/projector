import express, { Express } from "express";
import cluster from 'cluster';
import cookieParser from "cookie-parser";
import fs from "fs";
import { configureTestEnvironment, runUnitTests } from './tests';
import SwaggerUi from 'swagger-ui-express';
import { improveConsoleOutput } from './utils/utils';

const isDev = process.env.NODE_ENV === 'development' || process.argv.indexOf('--dev') > 0;
const isTest = process.env.NODE_ENV === 'test' || process.argv.indexOf('--test') > 0;
const clustersCount = 1;

function prepareInfrastructure() {
	['storage'].forEach(folder => {
		if (!fs.existsSync(`./${folder}`)) {
			fs.mkdirSync(`./${folder}`);
		}
	});
}

function start(){
	if (isDev) {
		improveConsoleOutput();
		console.clear();
	}

	//read the local config
	prepareInfrastructure();

	console.log('Development mode:', isDev);
	process.on('uncaughtException', function(err){
		console.log('EXP unhandled', err);
	});

	for(var i = 0; i < clustersCount; i++) {
		cluster.fork();
	}
}

function startTestServer(app: Express) {
	configureTestEnvironment(app);
	cluster.fork({
		pid: process.pid
	});
}

function startClusterElement() {
	if (isDev) {
		improveConsoleOutput();
	}

	import('./program').then(module => {
		const app = express();
		app.use(cookieParser());

		import('./swagger').then(async swagger => {
			const spec = await swagger.getOpenApiSpecification({ silent: !isDev });
			app.use('/swagger', SwaggerUi.serve, SwaggerUi.setup(spec, {
				explorer: true,
				swaggerOptions: {
					// docExpansion: 'none',
				},
			}));
			app.use('/swagger.json', (req, res) => {
				res.send(spec);
			});
		});

		module.runExpress(app);
	});
}

if (isTest) {
	if (cluster.isPrimary) {
		const app = express();
		app.use(cookieParser());
		startTestServer(app);
	} else {
		runUnitTests().then(() => {
			console.log('\n\nFinished');
			process.kill(parseInt(process.env.pid), 'SIGTERM');
		});
	}
} else {
	if (cluster.isPrimary) {
		start();
	} else {
		startClusterElement();
	}
}
