import axios from "axios";
import { Model, Types } from "./model";
import { ModelProxy, ObjectProxy } from "./model-proxy";
import { ModelList } from "./model-list";

export class Service {
	constructor(model, parent) {
		if (model === Object) {
			this.initObjectModel(model);
		} else {
			this.initClassicModel(model, parent);
		}
	}

	initObjectModel(model) {
		this.modelProperties = [];
		this.proxyClass = ObjectProxy.__prepareProxyClass(this, this.modelProperties);
	}

	initClassicModel(model, parent) {
		this.model = model;
		this.parentModel = parent;
		if (!model) throw new Error("Model should be defined");
		this.modelUrl = model.config.url;
		this.dependents = {};
		this.modelProperties = [];

		//create empty sample of the model item
		this.sample = new model(model);
		this.proxyClass = this.sample.__prepareProxyClass(this, this.modelProperties);
		this.propertyId = this.modelProperties.find(prop => prop.params.isId);
		this.dataStorage = {};
		Service.hash[model.config.name] = this;
	}

	create(data, parentItem) {
		if (data && data instanceof ModelProxy && !parentItem) {
			parentItem = data;
			data = undefined;
		}

		const res = new this.proxyClass(this);

		Object.defineProperty(res, '__data', {
			writeable: true,
			value: {
				__stored: {}
			}
		});

		if (parentItem) {
			Object.defineProperty(res, '__parent', {
				writeable: false,
				value: parentItem
			});
		}

		if (data) {
			res.setData(data);
		}
		if (res.__id) this.addToStorage(res.__id, res);
		return res;
	}

	createRaw(data, parentItem) {
		if (data && ModelProxy.isPrototypeOf(data.constructor) && !parentItem) {
			parentItem = data;
			data = undefined;
		}

		const res = new this.proxyClass(this);

		Object.defineProperty(res, '__data', {
			writeable: true,
			value: {
				__stored: {}
			}
		});

		if (parentItem) {
			Object.defineProperty(res, '__parent', {
				writeable: false,
				value: parentItem
			});
		}

		if (data) {
			Model.__populate(res, data);
		}
		if (res.__id) this.addToStorage(res.__id, res);
		return res;
	}

	save(items) {
		if (!(items instanceof Array)) items = [items];
		try {
			return Promise.all(items.map(async item => {
				if (item.dirty) {
					const saveUrl = this.getServiceUrl(item.__id, item.__parent && item.__parent.__id);
					const content = item.__toStore();
					const result = await axios[item.__id ? 'put' : 'post'](saveUrl, content);
					Model.__populate(item, result.data);
					return item;
				} else return item;
			}));
		} catch (error) {
			console.error(error);
		}
	}

	async getServiceData(serviceName, item) {
		const url = `${this.getServiceUrl(item)}/${serviceName}`;
		const data = await axios.get(url);
		return data.data;
	}

	delete(items) {
		if (!(items instanceof Array)) items = [items];
		try {
			return Promise.all(items.map(item => {
				const deleteUrl = this.getServiceUrl(item.__id, item.__parent && item.__parent.__id);
				return axios.delete(deleteUrl).then(result => {
					return result.data;
				});
			}));
		} catch (error) {
			console.error(error);
		}
	}

	getDependentService(parentItem) {
		if (this.dependents[parentItem.__id]) return this.dependents[parentItem.__id];

		const depentent = new DependentService(parentItem, this);
		this.dependents[parentItem.__id] = depentent;
		return depentent;
	}

	_loadedLists = {};

	getList(params, parentItem) {
		if (params && params.totalCount) return ModelList.loadCount(params, this, parentItem);

		if (parentItem === undefined && params instanceof ModelProxy) {
			parentItem = params;
			params = null;
		}

		const pid = parentItem && parentItem.__id || '_';
		let list = this._loadedLists[pid];

		if (!list){
			const modelList = this.constructor.modelList;
			list = new modelList(this, parentItem);
			this._loadedLists[pid] = list;
		}
		if (params) return list.load(params);
		return list;
	}

	async getItem(id, force, parentItem) {
		if (!force && this.dataStorage[id]) return this.dataStorage[id];

		const url = this.getServiceUrl(id, parentItem && (parentItem.__id || parentItem));

		try {
			const _data = await axios.get(url);
			const { data } = _data;
			let item = this.dataStorage[id];
			if (item && item instanceof ModelProxy) {
				item.__setData(data);
			} else {
				item = this.createRaw(data, parentItem);
				this.addToStorage(id, item);
			}
			return item;
		} catch (err) {
			console.error(err);
		}
	}

	async freshItem(item) {
		const id = item.__id;
		const parent = item.__parent;
		const url = this.getServiceUrl(id, parent);
		try {
			const _data = await axios.get(url);
			const { data } = _data;
			item.__setData(data);
		} catch (err) {
			console.error(err);
		}
	}

	get id() {
		return this.propertyId && this.propertyId.params.key || undefined;
	}

	get fid() {
		return this.propertyId && this.propertyId.name || undefined;
	}

	addToStorage(id, item) {
		this.dataStorage[id] = item;
	}

	contains(id) {
		return !!this.dataStorage[id];
	}

	getStored(id) {
		return this.dataStorage[id];
	}

	getServiceUrl(self, parent) {
		const id = self instanceof ModelProxy ? self.__id : self;
		if (!parent && self && self.__parent) parent = self.__parent;
		if (!this.parentService && this.parentModel && parent) {
			this.parentService = Service.createServiceFor(this.parentModel);
		}
		const url = [this.parentService && parent ? this.parentService.getServiceUrl(parent) : Service.getServiceUrl(), this.modelUrl];
		if (id) url.push(id);
		return url.join('/');
	}

	static getNamedService(modelName) {
		if (this.hash[modelName]) return this.hash[modelName];
		else return new Service(this.models[modelName]);
	}

	static registryModels(...models){
		models.forEach(model => this.models[model.config.name] = model);
	}

	static createServiceFor(model, parentModel, ServiceBase) {
		const modelname = model.config.name;
		const base = ServiceBase || this;
		if (this.hash[modelname]) return this.hash[modelname];

		if (Model.isPrototypeOf(model)) {
			return new base(model, parentModel);
		}
	}

	static initService(props) {
		Object.assign(this.defaultProps, props);
	}

	static getServiceUrl() {
		return this.defaultProps.serviceUrl.replace(/\/$/, '');
	}

	static get modelList() {
		return ModelList;
	}

	static hash = {};
	static models = {};
}

class DependentService {
	constructor(parentItem, service){
		this.parentItem = parentItem;
		this.service = service;
	}

	create(data) {
		return this.service.create(data, this.parentItem);
	}

	getItem(id, force) {
		return this.service.getItem(id, force, this.parentItem);
	}

	async getList(params) {
		if (params && params.totalCount) return await this.service.getList(params, this.parentItem);
		if (!this.list) this.list = await this.service.getList(params || {}, this.parentItem);
		return this.list;
	}
}

Service.defaultProps = {
	serviceUrl: ''
}

Service.ObjectService = new Service(Object);
