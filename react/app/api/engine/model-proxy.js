import { ModelList } from "./model-list";

export class ModelProxy {
	constructor(service) {
		this.__service = service;
		this.__dirty = true;
	}

	get created() { return !this.__id; }

	get dirty() {
		if (this.__dirty) return this.__dirty;
		const fieldsDirty = this.__service.modelProperties.some(({ name, params }) => {
			const value = this[name];
			if (value instanceof ModelProxy && value.__id) return value.__id !== this.__data[params.key];
			if (value instanceof ModelProxy || value instanceof ModelList) {
				return value.dirty;
			}
		})
		return fieldsDirty;
	}

	get __id() {
		return this[this.__service.fid];
	}

	get(dataFieldPath) {
		if (!(dataFieldPath instanceof Array)) dataFieldPath = dataFieldPath.split('.');
		const getItem = (source, fields) => {
			const field = fields.shift();
			if (!fields.length && source) return source[field];
			return getItem(source[field], fields);
		}
		return getItem(this.__data, dataFieldPath);
	}

	setDirty(value) {
		this.__dirty = value;
	}

	async save(data) {
		if (data) this.setData(data);
		const list = await this.__service.save(this);
		return list && list[0] || undefined;
	}

	delete() {
		this.__service.delete(this);
	}

	plain() {
		return this.__service.modelProperties.reduce((res, { name }) => {
			res[name] = this[name] instanceof ModelProxy ? this[name].plain() : this[name];
			return res;
		}, {})
	}

	async fresh() {
		return await this.__service.freshItem(this);
	}

	__toStore(force) {
		const service = this.__service;
		return this.__service.modelProperties.reduce((res, { name, params }) => {
			if (params.isId || !params.readonly){
				const rname = params.key || name;
				const isParent = params.parent && typeof(params.parent) !== 'function';
				const _value = this[name];
				let value;
				if (_value !== undefined && _value !== null) {
					if (_value instanceof ModelProxy && _value.__id) { // state of foreign object is not important for us
						value = _value.__id;
					} else {
						const dirty = force || _value.dirty === undefined || _value.dirty;
						if (!dirty) return res;

						if (_value instanceof ModelProxy && dirty) {
							value = _value.__toStore(); // in this case we are storing full object into db
						} else if (_value instanceof ModelList && dirty) {
							value = _value.__toStore();
							_value.setDirty(false);
						} else if (_value instanceof Array) {
							value = _value.map(item => {
								if (params.link) { // item should be ModelProxy object
									return { [service.id]: item.__data[service.id] };
								}
								return item instanceof ModelProxy ? item.__toStore(true) : item
							});
						} else
							value = this.__data[rname];
						if (isParent && (value !== undefined && value !== null) && this.__parent)
							value = this.__parent.__id;
					}
					if (value !== undefined && value !== null) res[rname] = value;
				}
			}
			return res;
		}, {});
	}

	setData(data) {
		this.__service.modelProperties.forEach(({ name, params }) => {
			if (!params.readonly && data.hasOwnProperty(name)) {
				this[name] = data[name];
			}
		});
	}

	__getService() {
		return this.__data.__stored.__service;
	}

	__setData(data) {
		this.__dirty = false;
		this.__data.__stored = {}; // clean hashed values;
		/*this.__service.modelProperties.forEach(({ name }) => { // cleanup the data
			delete this.__data.__stored[name];
		});*/
		Object.assign(this.__data, data);
	}

	getParent() {
		return this.__parent;
	}

	async getServiceData(serviceName) {
		return await this.__service.getServiceData(serviceName, this);
	}

	__returnValue(fieldName, cb, lookAtData = true) {
		if (lookAtData && this.__data[fieldName] === undefined) return undefined;
		let res = this.__getHashedValue(fieldName);
		if (res === undefined) {
			res = cb();
			if (res instanceof Promise) {
				return res.then(value => {
					this.__setHashedValue(fieldName, value)
					return value;
				});
			} else {
				this.__setHashedValue(fieldName, res);
			}
		}
		return res;
	}

	__setValue(fieldName, original, cb) {
		let vl = cb && ( cb instanceof Function ? cb() : cb) || original;
		const prev = this.__data[fieldName];
		if (prev !== vl) this.__dirty = true;
		this.__data[fieldName] = vl;
		this.__data.__stored[fieldName] = original;
	}

	__getHashedValue(fieldName) {
		return this.__data.__stored[fieldName];
	}

	__setHashedValue(fieldName, value) {
		this.__data.__stored[fieldName] = value;
	}
}

export class ObjectProxy {
	constructor(service) {
		this.__service = service;
		this.__dirty = true;
	}

	get dirty() {
		return this.__dirty;
	}

	setDirty(value) {
		this.__dirty = value;
	}

	plain() {
		return this.__toStore();
	}

	setData(data) {
		this.__setData(data);
	}

	__getService() {
		return this.__service;
	}

	__returnValue(fieldName, cb, lookAtData) {
		return this[fieldName];
	}

	__setValue(fieldName, original, cb) {
		this[fieldName] = original;
	}

	__toStore() {
		const props = Object.getOwnPropertyNames(this);
		return props.filter(prop => prop.indexOf('__') !== 0)
			.reduce((res, prop) => {
				res[prop] = this[prop];
				return res;
			}, {});
	}

	__setData(data) {
		Object.assign(this, data);
	}

	static __prepareProxyClass(service, properties) {
		return ObjectProxy;
	}
}
