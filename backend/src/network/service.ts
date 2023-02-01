import { Request, Response } from ".";
import { Router, Request as ERequest, Response as EResponse } from "express";

import * as entities from "../server";
import { IEntityController } from '../backend/core/entity-processor';
import { IRouter } from '~/backend/core/models';
// const trans = require('./workers/transcoders-check.js');

class ServiceProxy {
	private service!: any;
	private model!: any;

	constructor(service, model) {
		this.service = service;
		this.model = model;
	}

	get(path: string, callback: (...args: any[]) => void, options?: any) {
		this.service.get(path, callback, this.model, options);
		return this;
	}

	post(path: string, callback, options?) {
		this.service.post(path, callback, this.model, options);
		return this;
	}

	put(path: string, callback, options?) {
		this.service.put(path, callback, this.model, options);
		return this;
	}

	options(path: string, callback, options?) {
		this.service.options(path, callback, this.model, options);
		return this;
	}

	delete(path: string, callback, options?) {
		this.service.delete(path, callback, this.model, options);
		return this;
	}
}

type TCallback = (...args: any[]) => void;
type TOptions = { [key: string]: any };

export class Service {
	private router: Router;
	private _request: Request;
	private _response: Response;

	public get request(): Request {
		return this.request;
	}

	public get response(): Response {
		return this.response;
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
		this.router = Router();
		// init workers
		// setInterval(() => trans.run(this), trans.interval);
	}

	for(model) {
		return new ServiceProxy(this, model);
	}

	get(path: string, callback: TCallback, model?: IEntityController<any>, options?: TOptions) {
		this.router.get(path, (req, res, next) => {
			this.processRequest(req, res, next, callback, model, options);
		});
	}

	post(path: string, callback: TCallback, model?: IEntityController<any>, options?: TOptions) {
		this.router.post(path, (req, res, next) => {
			this.processRequest(req, res, next, callback, model, options);
		});
	}

	put(path: string, callback: TCallback, model?: IEntityController<any>, options?: TOptions) {
		this.router.put(path, (req, res, next) => {
			this.processRequest(req, res, next, callback, model, options);
		});
	}

	options(path: string, callback: TCallback, model?: IEntityController<any>, options?: TOptions) {
		this.router.options(path, (req, res, next) => {
			this.processRequest(req, res, next, callback, model, options);
		})
	}

	delete(path: string, callback: TCallback, model?: IEntityController<any>, options?: TOptions) {
		this.router.delete(path, (req, res, next) => {
			this.processRequest(req, res, next, callback, model, options);
		});
	}

	init(app, config) {
		/*fs.readdirSync(config.apiFolder).forEach(item => {
			try{
				var modulePath = `${process.env.INIT_CWD}/${config.apiFolder}`;
				var module = require(`${modulePath}/${item}`);
				module && module.configure && module.configure(this);
			} catch( exception ){
				console.error("Exception in module " + item + "\n", exception.stack);
			}
		});*/
		Object.keys(entities).forEach(entityName => {
			const entity = new entities[entityName]() as IRouter;
			entity.configure(this);
		});

		this.router.options('\/*', (req: ERequest, res: EResponse, next) => {
			this.setCORSHeaders(res);
			res.send();
		});
		app.use(config.apiPath, this.router);
	}

	_when(mayBePromise, cb) {
		if (mayBePromise instanceof Promise) return mayBePromise.then((...args) => cb(...args));
		return cb(mayBePromise);
	}

	processRequest(req: ERequest, res: EResponse, next: () => void, callback, model, options) {
		this.setACAOHeader(res);
		const request = new Request(options);
		const response = new Response();

		this._request = request;
		this._response = response;

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
				const callbackResult = await callback(...args);
				if (callbackResult) response.set(callbackResult);
				response.send(res);
			} catch (error) {
				if (error?.message) {
					response.setError(error.message, error.code);
				} else {
					response.setError(error);
				}
				response.send(res);
			}
		});
	}

}

export const service = new Service();