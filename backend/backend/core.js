const config = require('../config.js');
const db = require('mongoose');
const md5 = require('md5');
const mongo = require('mongodb');
const u = require('util');

const objId = mongo.ObjectID;
const Schema = db.Schema;

const reconnect = async () => {
	try {
		const res = await db.connect(config.dbLink, {
			useMongoClient: true,
			reconnectTries: Number.MAX_VALUE,
			user: config.dbUser,
			pass: config.dbPassword,
			db: 'projector'
		});
	} catch (error) {
		console.log('Connection failed', config.dbUser, config.dbPassword);
		console.error(error);
	}
};

const prepareHash = doc => {
	const clean = Object.assign({}, doc);
	delete clean._update;
	delete clean._create;
	delete clean.__v;
	return md5(JSON.stringify(clean));
}

reconnect();

class Core {
	static get models() {
		if (!this._models) this._models = {};
		return this._models;
	}

	static get dbObjectModel() {
		if (!this._dbObjectModel) this._dbObjectModel = this.getModel('dbobjects');
		return this._dbObjectModel;
	}

	static normalize(item, user) {
		var newItem = {}, userId = typeof(user._id) == "string" ? new objId(user._id): user._id;

		if(!item._id){
			newItem = Object.assign({
				_create: {
					_dt: new Date()
				},
				_update: {
					_dt: new Date()
				}
			}, item);
			if(user && user._id) {
				newItem._create._user = userId;
				newItem._update._user = userId;
			}
		} else {
			newItem = Object.assign(newItem , item, {
				_update: {
					_dt: new Date(),
				}
			});
			delete newItem._create;
			if(user && user._id) newItem._update._user = userId;
		}

		//normalize all Ids
		this.fixIds(newItem);

		return newItem;
	}

	static fixIds(item) {
		if(item === null || item === undefined || typeof(item) !== "object") return item;

		Object.keys(item).forEach(prp => {
			if(prp.match(/(^|\.)_/) && u.isString(item[prp])) {
				try{
					item[prp] = new objId(item[prp]);
				} catch(exp){ }
			} else if(u.isArray(item[prp])) {
				item[prp] = item[prp].map(aitem => Core.fixIds(aitem));
			} else if (u.isObject(item[prp])) {
				item[prp] = Core.fixIds(item[prp]);
			}
		});
		return item;
	}

	static async deleteItem(model, itemId, user) {
		var userId = u.isString(user._id) ? new objId(user._id) : user._id;
		const res = await model.update({ _id: itemId }, {
			_deleted: {
				_dt: new Date(),
				_user: userId
			}
		});
		Core.dbObjectModel.update({ _id: itemId }, { status: 'deleted' });
		return res;
	}

	static prepareMetadata(source, dflt) {
		var src = Object.assign({}, dflt || {}, source), meta = {};

		if(src.sort){
			meta.sort = {};
			if(typeof(src.sort)=="string")
				meta.sort[src.sort] = src.dir == "desc" ? -1 : 1;
			else
				meta.sort = src.sort;
		} else meta.sort = {'_update._dt': 'desc'}
		if(src.offset)
			meta.skip = parseInt(src.offset);
		else if(src.page && src.count)
			meta.skip = (parseInt(src.page > 0 ? src.page : 1) - 1) * parseInt(src.count);
		if(src.count)
			meta.limit = parseInt(src.count);
		return meta;
	}
}

class DbModel {
	constructor(name, schema) {
		this.name = name;
		this.dbModel = db.model(name, schema || {}, name);
	}

	eval(func, args) {
		return new Promise((resolve, reject) => {
			db.connection.db.eval(func, args, (err, res) => {
				if(err){
					reject(err);
					return;
				}
				res.forEach(item => item._coretype = this.name);
				resolve(res);
			});
		});
	}

	async getItem(itemId, options) {
		const results = await this.find({_id: itemId}, options, {});
		return results.length && results[0] || undefined;
	}

	async find() {
		return new Promise((resolve, reject) => {
			var delCond = {_deleted: {$exists: false}}, args = [];
			[...arguments].forEach((argument, index) => {
				if (arguments.length == 1 || index < arguments.length - 1)
					args.push(Core.fixIds(argument));
			});
			var options = arguments.length > 1 && arguments[arguments.length -1] || null;

			args.push((error, res) => {
				if(error){
					reject(error);
					return;
				}
				res.forEach(item => {
					Object.assign(item._doc, {
						_hash: prepareHash(item._doc),
						_coretype: this.name
					});
				});
				resolve(res.map(i => i._doc));
			});
			if(arguments.length) Object.assign(args[0], delCond);

			var ops = this.dbModel.find(...args);
			if(options){
				options.sort && ops.sort(options.sort);
				options.skip && ops.skip(options.skip);
				options.limit && ops.limit(options.limit);
			}
		});
	}

	getCountOf(condition) {
		return new Promise((resolve, reject) => {
			this.dbModel.count(Core.fixIds(condition), (error, res) => {
				if(error) reject(error);
				else resolve(res);
			});
		})
	}

	async findList() { // pagination finding
		const resd = [];
		const delCond = { _deleted: { $exists: false } }
		const pargs = [...arguments];
		const condition = {};
		const projection = {};
		const meta = {};
		const cb = (resolve, reject) => {
			return (error, res) => {
				if (error) reject(error);
				else resolve(res);
			}
		}
		const cbs = { counter: null, data: null }

		if (pargs.length >= 1) {
			Object.assign(condition, Core.fixIds(pargs[0]));
		}
		if (pargs.length === 2) {
			Object.assign(meta, pargs[1]);
		}
		if (pargs.length === 3) {
			Object.assign(projection, pargs[1]);
			Object.assign(meta, pargs[2]);
		}

		const onlyCount = meta.totalCount === 'true';
		var options = Core.prepareMetadata(meta);

		Object.assign(condition, delCond);

		!onlyCount && resd.push(new Promise((resolve, reject) => {
			cbs.data = cb(resolve, reject);
		}));

		resd.push(new Promise((resolve, reject) => {
			cbs.counter = cb(resolve, reject);
		}));

		//get count of records
		this.dbModel.count(condition, cbs.counter);
		if (!onlyCount) {
			var ops = this.dbModel.find(condition, projection, cbs.data);
			if(options){
				options.sort && ops.sort(options.sort);
				options.skip && ops.skip(options.skip);
				options.limit && ops.limit(options.limit);
			}
		}


		const res = await Promise.all(resd);
		if(res[0] instanceof Error){
			reject(res[0]);
			return;
		}

		if (!onlyCount) {
			res[0].forEach(item => {
				Object.assign(item._doc, {
					_hash: prepareHash(item._doc),
					_coretype: this.name
				});
			});

			return {
				data: res[0].map(i => i._doc),
				_: {
					total: res[1],
					page: options.skip !== undefined && (Math.floor(options.skip / options.limit) + 1)|| 1,
					offset: options.skip,
					count: res[0].length,
					more: res[1] > options.skip + options.limit
				}
			};
		} else {
			return {
				count: res[0]
			};
		}
	}

	create(data) {
		return new Promise((resolve, reject) => {
			delete data._coretype;
			this.dbModel.create(data, (error, resObj) => {
				if(error) reject(error);
				else {
					resolve(resObj._doc);
					if(this !== Core.dbObjectModel)
						Core.dbObjectModel.create({_id: resObj._id, type: this.name, status: 'normal', objectId: resObj._id});
				}
			});
		});
	}

	update(condition, obj) {
		return new Promise((resolve, reject) => {
			var cp = Object.assign({}, obj);

			delete cp._id;
			delete cp._coretype;
			delete cp._hash;
			this.dbModel.update(Core.fixIds(condition), cp, (error, res) => {
				if(error) reject(error);
				else {
					resolve(res);
				}
			});
		});
	}

	updateItem(obj) {
		if(!obj._id) throw new Error("Object should be created!");
		return new Promise((resolve, reject) => {
			var cp = Object.assign({}, obj);
			delete cp._id;
			delete cp._coretype;
			delete cp._hash;
			this.dbModel.update({_id: obj._id}, cp, error => {
				if(error) reject(error);
				else {
					this.dbModel.find({_id: obj._id}, (error, res) => {
						if(error) reject(error);
						else {
							Object.assign(res[0]._doc, {
								_hash: prepareHash(res[0]._doc),
								_coretype: this.name
							});
							resolve(res[0]._doc);
						}
					});
				}
			});
		});
	}

	deleteItem(itemId, user) {
		return Core.deleteItem(this, itemId, user);
	}
}

Core.getModel = function(modelName, schema) {
	schema = schema || new Schema({}, { strict: false });
	if(this.models[modelName]) return this.models[modelName];
	var model = new DbModel(modelName, schema, this);
	this.models[modelName] = model;
	return model;
}

class CommonEntity {
	constructor(app) {
		this.app = app;
	}

	setSession(session) {
		this.app.setOnceSession(session);
		return this;
	}
}

module.exports = {
	Core,
	CommonEntity
};


