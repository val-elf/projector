const fs = require('fs');
const Router = require('express').Router;
const Request = require('./network/request');
const Response = require('./network/response');
// const trans = require('./workers/transcoders-check.js');

class ServiceProxy {
	constructor(service, model) {
		Object.assign(this, { service, model });
	}

	get(path, callback, options) {
		this.service.get(path, callback, this.model, options);
		return this;
	}

	post(path, callback, options) {
		this.service.post(path, callback, this.model, options);
		return this;
	}

	put(path, callback, options) {
		this.service.put(path, callback, this.model, options);
		return this;
	}

	options(path, callback, options) {
		this.service.options(path, callback, this.model, options);
		return this;
	}

	delete(path, callback, options) {
		this.service.delete(path, callback, this.model, options);
		return this;
	}
}

class Service {
	setCORSHeaders(res) {
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
		res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
	}

	constructor() {
		this.router = Router();
		// init workers
		// setInterval(() => trans.run(this), trans.interval);
	}

	for(model) {
		return new ServiceProxy (this, model);
	}

	get(path, callback, model, options) {
		this.router.get(path, (req, res, next) => {
			this.processRequest(req, res, next, callback, model, options);
		});
	}

	post(path, callback, model, options) {
		this.router.post(path, (req, res, next) => {
			this.processRequest(req, res, next, callback, model, options);
		});
	}

	put(path, callback, model, options) {
		this.router.put(path, (req, res, next) => {
			this.processRequest(req, res, next, callback, model, options);
		});
	}

	options(path, callback, model, options) {
		this.router.options(path, (req, res, next) => {
			this.processRequest(req, res, next, callback, model, options);
		})
	}

	delete(path, callback, model, options) {
		this.router.delete(path, (req, res, next) => {
			this.processRequest(req, res, next, callback, model, options);
		});
	}

	init(app, config) {
		fs.readdirSync(config.apiFolder).forEach(item => {
			try{
				var modulePath = `${process.env.PWD}/${config.apiFolder}/`;
				var module = require(`${modulePath}/${item}`);
				module && module.configure && module.configure(this);
			} catch( exception ){
				console.error("Exception in module " + item + "\n", exception.stack);
			}
		});
		this.router.options('\/*', (req, res, next) => {
			this.setCORSHeaders(res);
			res.send();
		});
		app.use(config.apiPath, this.router);
	}

	_when(mayBePromise, cb) {
		if (mayBePromise instanceof Promise) return mayBePromise.then((...args) => cb(...args));
		return cb(mayBePromise);
	}

	processRequest(req, res, next, callback, model, options) {
		const request = new Request(options);
		const response = new Response();

		this.request = req;
		this.response = res;

		// this.setCORSHeaders(res);
		this._when(request.receive(req), async () => {
			const body = request.body ?
				typeof(request.body) != "object" && req.headers['content-type'] === 'application/json' ? JSON.parse(request.body) : request.body
				: null;
			const params = Object.assign({}, req.params, {_metadata: req.query});

			if(request.multipart){
				Object.assign(params, request.multipart.parsed);
			}
			var args = [params];
			body && args.push(body);

			try{
				const callbackResult = await callback.apply({ app: this, request, response, model }, args);
				if (callbackResult) response.set(callbackResult);
				response.send(res);
			} catch (error) {
				response.setError(error);
				response.send(res);
			}
		});
	}

}

module.exports = new Service();