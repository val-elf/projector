import axios from "axios";
import { ModelProxy, ObjectProxy } from './model-proxy';

export class ModelList extends Array {

	constructor(service, parentItem, rawdata) {
		super();
		Object.assign(this, {
			service,
			parentItem,
			_params: {}
		});
		if (rawdata && rawdata instanceof Array) {
			const values = rawdata.map(value => {
				return service.createRaw(value, parentItem);
			})
			this.push(...values);
			this.__dirty = false;
		}
	}

	_onListLoad = [];
	__dirty = false;

	get dirty() {
		if (this.__dirty) return this.__dirty;
		const isItemDirty = item => (item instanceof ModelProxy || item instanceof ObjectProxy) && item.dirty;
		return this.some(item => isItemDirty(item));
	}

	setDirty(value) {
		this.forEach(item => {
			if (item instanceof ModelProxy || item instanceof ObjectProxy) item.setDirty(value);
		})
		this.__dirty = value;
	}

	on(eventType, cb) {
		switch(eventType) {
			case 'listLoad':
				cb && this._onListLoad.push(cb);
			break;
			default:
				throw new Error(`Unknown event type ${eventType}`);
			break;
		}
	}

	fire(eventType, params) {
		switch(eventType) {
			case 'listLoad':
				return this._onListLoad.reduce((res, cb) => { return cb(res); }, params);
			break;
			default:
				throw new Error(`Unknown event type ${eventType}`)
			break;
		}
	}

	flush() {
		this.splice(0, this.length);
		if (this._cancelToken) {
			this._cancelToken.cancel();
			this._cancelToken = null;
			this.__loading = false;
		}
		delete this._meta;
	}

	push(...items) {
		super.push(...items);
		if (items.length) this.__dirty = true;
	}

	unshift(...items) {
		super.unshift(...items);
		if (items.length) this.__dirty = true;
	}

	shift() {
		if (this.length) this.__dirty = true;
		return super.shift();
	}

	pop() {
		if (this.length) this.__dirty = true;
		return super.pop();
	}

	splice(start, deleteCount, ...items) {
		if (deleteCount > 0 || items.length) this.__dirty = true;
		return super.splice(start, deleteCount, ...items);
	}

	__toStore() {
		return [...this.map(item => item.__toStore(true))];
	}

	static async loadCount(params, service, parentItem) {
		const url = service.getServiceUrl(undefined, parentItem);
		const { data } = await axios.get(url, { params });
		return data;
	}

	async load(params) {
		if (this.__loading) {
			await this.__loadPromise;
			return this;
		}
		const url = this.service.getServiceUrl(undefined, this.parentItem);
		if (!params || !Object.keys(params).length) {
			super.splice(0, this.length);
			this._params = {};
		}
		else Object.assign(this._params, params);

		this.__dirty = false;
		try{
			this._cancelToken = axios.CancelToken.source();
			this.__loading = true;
			this.__loadPromise = axios.get(url, { params: this._params, cancelToken: this._cancelToken.token });
			const { data } = await this.__loadPromise;
			super.push(...(data.data || data).map(source => {
				const newItem = this.service.createRaw(source, this.parentItem);
				const existsIndex = this.findIndex(item => item.__id === newItem.__id);
				if (existsIndex > -1) {
					this.splice(existsIndex, 1, newItem);
					return null;
				}
				if (newItem) this.service.addToStorage(newItem.__id, newItem);
				return newItem;
			}).filter(item => item));

			this._meta = {};
			Object.keys(data).forEach(key => {
				if (key === 'data') return;
				this._meta[key] = data[key];
			});
			return this.fire('listLoad', this);
		} finally {
			this.__loading = false;
			this._cancelToken = null;
		}
	}

	skip() {
		if (this._cancelToken) {
			this._cancelToken.cancel();
			this._cancelToken = null;
			this.__loading = false;
		}
	}

	get meta() {
		return this._meta && this._meta._;
	}
}

