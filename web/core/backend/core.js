var config = require('../config.js'),
	q = require("node-promise"),
	promise = q.Promise,
	db = require('mongoose'),
	mongo = require('mongodb'),
	objId = mongo.ObjectID,
	u = require('util'),
	d = require('./network/lang.js'),
	extend = require('extend'),
	Schema = db.Schema;

db.connect(config.dbLink);
var models = {}, core;

module.exports = core = {
	objectId: objId,
	model: function(modelName, schema){
		schema = schema || new Schema({}, {strict: false});
		if(models[modelName]) return models[modelName];
		var model = new Model(modelName, schema);
		models[modelName] = model;
		return model;
	},

	normalize: function(item, user){
		var newItem = {}, userId = typeof(user._id) == "string" ? new objId(user._id): user._id;

		if(!item._id){
			newItem = d.mixin({
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
			newItem = d.mixin(newItem , item, {
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
	},

	fixIds: function(item){
		var vm = this;
		if(item === null || item === undefined || typeof(item) !== "object") return item;

		Object.keys(item).forEach(function(prp){
			if(prp[0] == '_' && u.isString(item[prp])){
				try{
					item[prp] = new objId(item[prp]);
				} catch(exp){ }
			}
			if(u.isArray(item[prp])){
				item[prp].forEach(function(aitem, index){
					item[prp][index] = vm.fixIds(aitem);
				});
			}
		});
		return item;
	},

	deleteItem: function(model, itemId, user){
		var userId = u.isString(user._id) ? new objId(user._id) : user._id;
		return model.update({_id: itemId}, {
			_deleted: {
				_dt: new Date(),
				_user: userId
			}
		});
	},

	prepareMetadata: function(source, dflt){
		var src = extend({}, dflt || {}, source), meta = {};

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
};

var
	dbObjectModel,
	Model = function(name, schema){
		model = {
			name: name,
			dbModel: db.model(name, schema || {}, name),
			eval: function(func, args){
				var dfr = new promise();
				db.connection.db.eval(func, args, (err, res) => {
					if(err){
						dfr.reject(err);
						return;
					}
					res.forEach(item => item._coretype = this.name);
					dfr.resolve(res);
				});
				return dfr;
			},
			find: function(){
				var dfr = new promise(), delCond = {_deleted: {$exists: false}}, args = [];
				for(var i in arguments)
					(arguments.length == 1 || i < arguments.length - 1) && args.push(module.exports.fixIds(arguments[i]));
				var options = arguments.length > 1 && arguments[arguments.length -1] || null;

				args.push((error, res) => {
					if(error){
						dfr.reject(error);
						return;
					}
					res.forEach(item => item._doc._coretype = this.name);
					dfr.resolve(res);
				});
				if(arguments.length) extend(args[0], delCond);

				var ops = this.dbModel.find.apply(this.dbModel, args);
				if(options){
					options.sort && ops.sort(options.sort);
					options.skip && ops.skip(options.skip);
					options.limit && ops.limit(options.limit);
				}
				return dfr;
			},

			getCountOf: function(condition){
				var dfr = new promise();
				this.dbModel.count(condition, function(error, res){
					if(error) dfr.reject(error);
					else dfr.resolve(res);
				})
				return dfr;
			},

			findList: function(){ // pagination finding
				var dfr = new promise(),
					resd = [new promise(), new promise()],
					delCond = {_deleted: {$exists: false}},
					args = [], //argumetns for finding elements
					cargs = [] // arguments for counting total elements (without pagings limitations)
				;

				for(var i in arguments){
					if(arguments.length == 1 || i < arguments.length - 1){
						args.push(arguments[i]) && cargs.push(arguments[i]);
					}
				}
				var options = core.prepareMetadata(arguments.length > 1 && arguments[arguments.length -1] || {});

				args[0] && extend(args[0], delCond);
				cargs[0] && extend(cargs[0], delCond);

				args.push(function(error, res){
					if(error) resd[0].reject(error);
					else resd[0].resolve(res);
				});
				cargs.push(function(error, res){
					if(error) resd[1].reject(error);
					else resd[1].resolve(res);
				});

				q.all(resd).then(res => {
					if(res[0] instanceof Error){
						dfr.reject(res[0]);
						return;
					}

					res[0].forEach(item => item._doc._coretype = this.name);

					dfr.resolve({
						data: res[0],
						_: {
							total: res[1],
							page: options.skip !== undefined && (Math.floor(options.skip / options.limit) + 1)|| 1,
							offset: options.skip,
							count: res[0].length,
							more: res[1] > options.skip + options.limit
						}
					});
				});


				var ops = this.dbModel.find.apply(this.dbModel, args);
				//get count of records
				this.dbModel.count.apply(this.dbModel, cargs);
				if(options){
					options.sort && ops.sort(options.sort);
					options.skip && ops.skip(options.skip);
					options.limit && ops.limit(options.limit);
				}
				return dfr;
			},

			create: function(base){
				var dfr = new promise();
				delete base._coretype;
				this.dbModel.create(base, (function(error, resObj){
					if(error) dfr.reject(error);
					else {
						dfr.resolve(resObj);
						if(this !== dbObjectModel)
							dbObjectModel.create({_id: resObj._id, type: this.name, status: 'normal', objectId: resObj._id});
					}
				}).bind(this));
				return dfr;
			},

			update: function(condition, obj) {
				var dfr = new promise(); cp = extend({}, obj);
				delete cp._id;
				delete cp._coretype;
				this.dbModel.update(condition, cp, (error, res) => {
					if(error) dfr.reject(error);
					else {
						dfr.resolve({_doc: {}});
					}
				})
				return dfr;
			},

			updateItem: function(obj){
				if(!obj._id) throw new Exception("Object should be created!");
				var dfr = new promise(); cp = extend({}, obj), self = this;
				delete cp._id;
				delete cp._coretype;
				this.dbModel.update({_id: obj._id}, cp, (error, res) => {
					if(error) dfr.reject(error);
					else {
						self.dbModel.find({_id: obj._id}, (error, res) => {
							if(error) dfr.reject(error);
							else {
								res[0]._doc._coretype = this.name;
								dfr.resolve(res[0]);
							}
						});
					}
				});
				return dfr;
			},

			deleteItem: function(itemId, user){
				return core.deleteItem(this, itemId, user);
			}

		};
		return model;
	}
;

dbObjectModel = module.exports.model('dbobjects');


