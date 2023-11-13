import { Request, Response } from ".";
import { Router, Request as ERequest, Response as EResponse } from "express";

import { IRouter } from '~/backend/core/models';
import { reconnect } from '~/backend/core/db-bridge';
// const trans = require('./workers/transcoders-check.js');

class ServiceProxy {
	private service!: Service;

	constructor(service: Service) {
		this.service = service;
	}

	get(path: string, callback: (...args: any[]) => void, options?: any) {
		this.service.get(path, callback, options);
		return this;
	}

	post(path: string, callback, options?) {
		this.service.post(path, callback, options);
		return this;
	}

	put(path: string, callback, options?) {
		this.service.put(path, callback, options);
		return this;
	}

	patch(path: string, callback, options?) {
		this.service.patch(path, callback, options);
		return this;
	}

	options(path: string, callback, options?) {
		this.service.options(path, callback, options);
		return this;
	}

	delete(path: string, callback, options?) {
		this.service.delete(path, callback, options);
		return this;
	}
}

type TCallback = (...args: any[]) => void | any;
type TOptions = { [key: string]: any };

export abstract class Service {
	private router: Router;
	private _request: Request;
	private _response: Response;

	private routers: IRouter[] = [];

	private static _instance: Service;
	public static get instance() {
		return this._instance;
	}

	public get request(): Request {
		return this._request;
	}

	public get response(): Response {
		return this._response;
	}

	setCORSHeaders(res: EResponse) {
		this.setACAOHeader(res);
		res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
		res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
	}

	setACAOHeader(res: EResponse) {
		res.setHeader('Access-Control-Allow-Origin', '*');
	}

	constructor() {
		// console.log('CONSTRUCT NEW SERVICE INSTANCE');
		if (Service._instance) {
			throw new Error('Service instance already exists. Use Service.instance instead.');
		}
		Service._instance = this;
		this.router = Router();
		// init workers
		// setInterval(() => trans.run(this), trans.interval);
	}

	for(model) {
		return new ServiceProxy(this);
	}

	get(path: string, callback: TCallback, options?: TOptions) {
		this.router.get(path, (req, res, next) => {
			this.processRequest(req, res, next, callback, options);
		});
	}

	post(path: string, callback: TCallback, options?: TOptions) {
		this.router.post(path, (req, res, next) => {
			this.processRequest(req, res, next, callback, options);
		});
	}

	put(path: string, callback: TCallback, options?: TOptions) {
		this.router.put(path, (req, res, next) => {
			this.processRequest(req, res, next, callback, options);
		});
	}

	patch(path: string, callback: TCallback, options?: TOptions) {
		this.router.patch(path, (req, res, next) => {
			this.processRequest(req, res, next, callback, options);
		});
	}
	options(path: string, callback: TCallback, options?: TOptions) {
		this.router.options(path, (req, res, next) => {
			this.processRequest(req, res, next, callback, options);
		})
	}

	delete(path: string, callback: TCallback, options?: TOptions) {
		this.router.delete(path, (req, res, next) => {
			this.processRequest(req, res, next, callback, options);
		});
	}

	async init(app, config) {
		const services = await import('../server');

		Object.keys(services).forEach(entityName => {
			const entity = new services[entityName]() as IRouter;
			entity.configure(this);
		});

		this.router.options('\/*', (req: ERequest, res: EResponse, next) => {
			this.setCORSHeaders(res);
			res.send();
		});

		app.use(config.apiPath, this.router);

		reconnect(config);
	}

	_when(mayBePromise, cb) {
		if (mayBePromise instanceof Promise) return mayBePromise.then(cb);
		return cb(mayBePromise);
	}

	processRequest(req: ERequest, res: EResponse, next: () => void, callback: TCallback, options) {
		this.setACAOHeader(res);
		const request = new Request(options);
		const response = new Response();

		this._request = request;
		this._response = response;

		this._when(request.receive(req), async () => {
			const body = request.body ?
				typeof(request.body) != "object" && req.headers['content-type'] === 'application/json' ? JSON.parse(request.body) : request.body
				: null;
			const params = Object.assign({}, req.params, { _metadata: req.query });

			if(request.multipart){
				Object.assign(params, request.multipart.parsed);
			}
			var args = [params];
			body && args.push(body);

			try{
				const instance = this.getRouterInstanceByProto(callback.prototype);
				if (instance && instance.model) { //process metadata by model
					instance.model.processMetadata(args[0]._metadata);
				}
				const callbackResult = await (instance ? callback.call(instance, ...args) : callback(...args));
				response.set(callbackResult);
				response.send(res);
			} catch (error) {
				console.error(error);
				if (error?.message) {
					response.setError(error.message, error.code);
				} else {
					response.setError(error);
				}
				response.send(res);
			}
			next();
		});
	}

	public registerCallback(method: string, path: string, options: any, callback: TCallback, proto: any, ) {
		const cmethod = this[method];
		callback.prototype = proto;
		cmethod.call(this, path, callback, options);
	}

	public registerRouter(router: IRouter) {
		if (!this.routers.includes(router)){
			this.routers.push(router);
		}
	}

	private getRouterInstanceByProto(proto: any) {
		return this.routers.find(r => {
			const rproto = r.constructor['__proto__'].prototype;
			return rproto === proto;
		});
	}
}

class _Service extends Service {}

export const service = new _Service();
