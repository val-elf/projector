import { Service } from "./service";
import { ModelProxy } from "./model-proxy";
import { ModelList } from "./model-list";
import utf8 from "utf8";
import moment from "moment";


/**
 * Model Params :
 * 	{
 * 		key - field of data for this object field
 * 		parent - determine field as a parent object
 * 		link - determine that field as a key for another object
 * 		readonly - this field cannot be modified
 * 		name - the name of the Service (only for service fields)
 * 	}
 */

export class Model {
	constructor(ownClass) {
		this.__ownClass = ownClass;
	}

	static create(data) {
		const service = Service.getNamedService(this.config.name);
		return service.create(data);
	}

	_getLinkedModelProperty(field, mapName) {
		let set;
		if (!field.params.readonly) {
			set = function(value) {
				if (value === null || value === undefined) {
					this.__setValue(mapName, value);
					return;
				}
				if (!(value instanceof ModelProxy)) {
					const service = Service.createServiceFor(field.typeName);
					value = service.createRaw(value);
				}
				value.setDirty(true);
				this.__setValue(mapName, value, value.__id || value.__toStore());
			}
		}
		return {
			get: function() {
				return this.__returnValue(mapName, () => {
					const typeName = Model.isPrototypeOf(field.typeName) ? field.typeName.config.name : field.typeName;
					const service = Service.getNamedService(typeName);
					const isFunc = typeof(field.params.parent) === "function";
					const isParent = field.params.parent === true;
					const raw = this.__data[mapName];
					if (typeof(raw) === 'string') {
						const linkedId = raw;
						if (isParent && this.__parent instanceof ModelProxy) return this.__parent;
						let parent = this.__parent;
						if (service.contains(linkedId)) return service.getStored(linkedId);
						if (service.parentModel) {
							parent = isFunc ? field.params.parent(parent || this) :
								this.__id ? this : undefined;
						}
						const res = service.getItem(raw, false, parent);
						return res;
					}
					if (raw instanceof Array && field.params.isArray) {
						return data.map(dt => service.createRaw(dt, this));
					}
					const result = service.createRaw(raw, this);
					return result;
				});
			},
			set
		};
	}

	_getDateProperty(field, mapName) {
		return {
			get: function() {
				return this.__returnValue(mapName, () => {
					return new Date(this.__data[mapName]);
				});
			},
			set: function(odate) {
				//check date
				if (!odate) {
					this.__setValue(mapName, undefined);
					return;
				}
				let date = odate;
				if (date instanceof moment)
					date = date.toDate();
				else if (!(date instanceof Date)){
					date = new Date(date);
				}
				date.setUTCHours(date.getHours());
				date.setUTCMinutes(date.getMinutes());
				date.setUTCSeconds(date.getSeconds());
				this.__setValue(mapName, date, () => date.toISOString());
			}
		};
	}

	_getCustomPopulatedProperty(fieldDescriptor, mapName) {
		return {
			get: function () {
				return this.__returnValue(mapName, () => {
					let res = this.__data[mapName];
					try {
						res = fieldDescriptor.depopulate(res);
					} finally {
						return res;
					}
				});
			},
			set: function(value) {
				return this.__setValue(mapName, value, _ => fieldDescriptor.populate(value));
			}
		}
	}

	_getNumberProperty(field, mapName) {
		return {
			get: function() {
				return this.__returnValue(mapName, () => Number(this.__data[mapName]));
			},
			set: function(value) {
				this.__setValue(mapName, value, () => {
					if (typeof(value) === 'number') return value;
					if (value === null || value === undefined) return undefined;
					const res = Number(value);
					if (isNaN(res)) return undefined;
					return res;
				});
			}
		};
	}

	_getBooleanProperty(field, mapName) {
		return {
			get: function() {
				return this.__returnValue(mapName, () => this.__data[mapName] === 'true' || this.__data[mapName] === true);
			}
		};
	}

	_getChildServiceProperty(field, mapName) {
		return {
			get: function() {
				const service = Service.getNamedService(field.params.name);
				// const key = field.params.key || mapName;
				/*if (key) {
					return this.__returnValue(mapName, () => {
						const data = this.__data[mapName];
						if (data instanceof Array) {
							return data.map(dt => service.createRaw(dt));
						}
						return service.createRaw(data);
					});
				} else {*/
				return this.__returnValue(mapName, () => service.getDependentService(this), false);
				/*}*/
			}
		}
	}

	_getParent(parentOption) {
		if (typeof(parentOption) === 'string') return this[parentOption];
		if (typeof(parentOption) === 'function') return parentOption(this);
	}

	_getArrayProperty(field, mapName) {
		var type = field.typeName[0];
		const { params } = field;
		const isLink = !!params && !!params.link;
		const hasParent = params && params.parent;
		if (Type.isPrototypeOf(type)) {
			// this is a linked property
		} else if (type === Types.date) {

		} else if (type === Types.number) {

		} else if (type === Types.boolean) {

		} else if (typeof(type) === 'string') {
			return {
				get: function() {
					return this.__returnValue(mapName, ()=> {
						const service = Service.getNamedService(type);
						const rawValues = this.__data[mapName];
						return new ModelList(service, this, rawValues);
					});
				},
				set: function(value) {
					this.__setValue(mapName, value);
				}
			};
		} else if (type === Object || Model.isPrototypeOf(type) || typeof(type) === 'string') {
			const service = type === Object ? Service.ObjectService : Service.getNamedService(type.config.name);
			return {
				get: function() {
					return this.__returnValue(mapName, () => {
						const values = this.__data[mapName];
						const list = new ModelList(service, this);
						const parent = hasParent ? this._getParent(params.parent) : undefined;
						if (values && values instanceof Array) {
							list.push(...values.map(value => {
								if (isLink) return service.getItem(value.__id, false, parent);
								return service.createRaw(value, parent || this);
							}));
							list.setDirty(false);
						};
						return list;
					}, false);
				},
				set: function(value) {
					this.__setValue(mapName, value);
				}
			}
		}
		return {
			get: function() {
				return this.__returnValue(mapName, () => this.__data[mapName]);
			},
			set: undefined
		}
	}

	__prepareProxyClass(service, outProperties) {
		const getAllProps = (type) => {
			const sub = Object.getPrototypeOf(type);
			const descs = {};
			if (sub && sub.constructor !== Model) {
				Object.assign(descs, getAllProps(sub));
			}
			const props = Object.getOwnPropertyNames(type);
			Object.assign(descs, props.reduce((res, prop) => {
				res[prop] = Object.getOwnPropertyDescriptor(type, prop)
				return res;
			}, {}));
			return descs;
		}

		const allProps = getAllProps(this);
		const allNames = Object.keys(allProps);

		class proxy extends ModelProxy { };
		this.mapFields = allNames.map(fieldName => {
			const descriptor = allProps[fieldName];
			if (descriptor.value instanceof Type) {
				let fieldDescriptor = descriptor.value;
				const typeName = fieldDescriptor.typeName || fieldDescriptor;
				let params = fieldDescriptor.params || {};
				const isService = typeName === Service;
				params = Object.assign({ // default field properties
						readonly: isService,
						isId: typeName === Types.id,
						parent: false
					},
					params
				);
				const mapName = params.key || fieldName;

				if (typeof(fieldDescriptor) === "string") fieldDescriptor = { fieldName: fieldDescriptor };
				Object.assign(fieldDescriptor, { params });

				const propertyValue = {
					get: function() {
						return this.__returnValue(mapName, () => this.__data[mapName]);
					},
					set: function(value) {
						this.__setValue(mapName, value);
					},
					enumerable: true,
				};

				// all common cases properties
				if (fieldDescriptor) {
					if (typeName && isService) {
						Object.assign(propertyValue, this._getChildServiceProperty(fieldDescriptor, mapName))
					} else if (typeName && Model.isPrototypeOf(typeName)) {
						Object.assign(propertyValue, this._getLinkedModelProperty(fieldDescriptor, mapName));
					} else if (typeName === Types.id || typeName === Types.string || typeName === Types.object) {
						// do nothing
					} else if (typeName === Types.number) {
						Object.assign(propertyValue, this._getNumberProperty(fieldDescriptor, mapName));
					} else if (typeName === Types.boolean) {
						Object.assign(propertyValue, this._getBooleanProperty(fieldDescriptor, mapName));
					} else if (typeName === Types.date) {
						Object.assign(propertyValue, this._getDateProperty(fieldDescriptor, mapName));
					} else if (typeName instanceof Array) {
						Object.assign(propertyValue, this._getArrayProperty(fieldDescriptor, mapName));
					} else if (fieldDescriptor instanceof Type) {
						if (typeof(typeName) === 'string' && !fieldDescriptor.isCustom) {
							Object.assign(propertyValue, this._getLinkedModelProperty(fieldDescriptor, mapName));
						} else Object.assign(propertyValue, this._getCustomPopulatedProperty(fieldDescriptor, mapName));
					} else if (typeName !== Types.object) { // it could be a name of model defined lately
						Object.assign(propertyValue, this._getLinkedModelProperty(fieldDescriptor, mapName));
					}
				}
				Object.defineProperty(proxy.prototype, fieldName, propertyValue);

				outProperties.push({
					name: fieldName,
					params: fieldDescriptor.params
				});

				if (fieldDescriptor.params.parent) {
					service.parentServiceName = fieldDescriptor.typeName;
				}
				return fieldName;
			} else {
				Object.defineProperty(proxy.prototype, fieldName, descriptor);
			}
		}).filter(field => field);

		return proxy;
	}

	static __populate(target, data) {
		target.__setData(data);
	}
}

class CustomType {
	populate(value) { return value; }
	depopulate(value) { return value; }
	constructor(options) {
		this.name = options.name;
		if (options.populate) this.populate = options.populate
		if (options.depopulate) this.depopulate = options.depopulate;
	}
}

export const Types = {
	boolean: 'boolean',
	string: 'string',
	number: 'number',
	date: 'date',
	model: 'model',
	object: 'object',
	id: 'id',
	base64: new CustomType({
		name: 'base64',
		populate: (value) => {
			return btoa(utf8.encode(value || ''));
		},
		depopulate: (value) => {
			return utf8.decode(atob(value)) || '';
		}
	})
}

export class Type {
	constructor(typeName, params) {
		if (!typeName) {
			throw new Error("Type cannot be empty");
		}

		if (typeName instanceof CustomType) {
			this.isCustom = true;
			this.typeName = typeName.name;
			this.populate = typeName.populate || this.populate;
			this.depopulate = typeName.depopulate || this.depopulate;
		} else {
			this.typeName = typeName;
		}
		this.params = params;
	}

	populate(value) {
		return value;
	}

	depopulate(value) {
		return value;
	}
	static Boolean = new Type(Types.boolean);
	static String = new Type(Types.string);
	static Number = new Type(Types.number);
	static Date = new Type(Types.date);
	static Model = new Type(Types.model);
	static Object = new Type(Types.object);
	static Id = new Type(Types.id);
	static Base64 = new Type(Types.base64);
}

