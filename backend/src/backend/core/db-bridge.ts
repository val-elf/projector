import * as db from "mongoose";
import { config } from "../../config";
import { ICommonEntity, IDbEntity, TFindArray, TFindList, TFindListResult } from './models';
import { IEntityController } from './entity-processor';

const objId = db.mongo.ObjectID;
type TEntity = ICommonEntity;

export class DbBridge<TEntity extends ICommonEntity> {
	private dbModel: db.Model<TEntity, {}, {}>;
	private name: string;

	public get modelName(): string { return this.name; }

    private static _models: { [key: string]: DbBridge<any> } = {};

	public static get models() {
		if (!this._models) this._models = {};
		return this._models;
	}

	private constructor(name, schema?: db.Schema) {
		this.name = name;
		this.dbModel = db.model<TEntity>(name, schema, name);
	}

	public static getBridgeByType(e: new () => IEntityController<ICommonEntity>) {
		const modelName: string = (e as any).modelName;
		return this.getBridge(modelName);
	}

	public static getBridge<TEntity extends ICommonEntity>(
        modelName: string,
        schema?: db.Schema
    ): DbBridge<TEntity> {
		schema = schema || new db.Schema({}, { strict: false });
		if(this.models[modelName]) return this.models[modelName];
		const model = new DbBridge<TEntity>(modelName, schema);
		this.models[modelName] = model;
		return model;
	}

	public static getInstance<TController extends IEntityController<any>>(model: string) {
		return controllers[model] as TController;
	}

	private static prepareMetadata(source, byDefault: any = {}) {
		const src = Object.assign({}, byDefault, source);
		const meta: any = {};

		if(src.sort){
			meta.sort = {};
			if(typeof(src.sort)=="string")
				meta.sort[src.sort] = src.dir == "desc" ? -1 : 1;
			else
				meta.sort = src.sort;
		} else meta.sort = {'_update._dt': 'desc'}
		if(src.offset)
			meta.skip = parseInt(src.offset);
		else if(src.page && src.collectionCount)
			meta.skip = (parseInt(src.page > 0 ? src.page : 1) - 1) * parseInt(src.collectionCount);
		if(src.collectionCount)
			meta.limit = parseInt(src.collectionCount);
		return meta;
	}

	eval(func, args) {
		return new Promise((resolve, reject) => {
			db.connection.db.command(func, args, (err, res) => {
				if(err){
					reject(err);
					return;
				}
				res.forEach(item => item._coretype = this.name);
				resolve(res);
			});
		});
	}

	async getItem(itemId, ...options: any[]): Promise<TEntity | undefined> {
		const results = await this.find({_id: itemId}, options, {});
		return results.length && results[0] || undefined;
	}

	async find(...args: any[]): Promise<TEntity[]> {
		return new Promise<TEntity[]>((resolve, reject) => {
			const delCond = {_deleted: {$exists: false}}, outargs = [];

            [...args].forEach((argument, index) => {
				if (outargs.length == 1 || index < outargs.length - 1)
				outargs.push(argument);
			});

            const options = outargs.length > 1 ? outargs[outargs.length -1] : null;

			outargs.push((error, res: IDbEntity<TEntity>[]) => {
				if(error){
					reject(error);
					return;
				}
				/* this is should be moved to DbObject
				res.forEach(item => {
					Object.assign(item._doc, {
						_hash: prepareHash(item._doc),
						_coretype: this.name
					});
				});
				*/
				resolve(res.map(i => i._doc as TEntity));
			});
			if(outargs.length) Object.assign(outargs[0], delCond);

			const ops = this.dbModel.find(...outargs);
			if(options){
				options.sort && ops.sort(options.sort);
				options.skip && ops.skip(options.skip);
				options.limit && ops.limit(options.limit);
			}
		});
	}

	getCountOf(condition): Promise<number> {
		return new Promise<number>((resolve, reject) => {
			this.dbModel.count(condition, (error, res) => {
				if(error) reject(error);
				else resolve(res);
			});
		})
	}

	async findList(condition?: any, projection?: any, meta?: any): Promise<TFindList<TEntity>>;
	async findList<T extends ICommonEntity>(
		condition: any,
		projection: any,
		meta: any,
	): Promise<TFindListResult<T>>
	{ // pagination finding
		const resd = [];
		const delCond = { _deleted: { $exists: false } }

		const cb = (resolve, reject) => {
			return (error, res) => {
				if (error) reject(error);
				else resolve(res);
			}
		}
		const cbs: {
			counter: ReturnType<typeof cb> | null,
			data: ReturnType<typeof cb> | null,
		} = { counter: null, data: null }

		const onlyCount = meta.totalCount === 'true';
		const options = DbBridge.prepareMetadata(meta);

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
			// const ops =
			this.dbModel.find(condition, projection, options, cbs.data);
			/*if(options){
				options.sort && ops.sort(options.sort);
				options.skip && ops.skip(options.skip);
				options.limit && ops.limit(options.limit);
			}*/
		}
		const res = await Promise.all(resd) as TFindArray<T> | number[] | Error[];

		if(res[0] instanceof Error){
			throw res[0];
		}

		if (!onlyCount) {
			const result = res.map(i => i._doc as T);
			return { result, options: { ...options, total: res[1] } };
		} else {
			return {
				count: res[0] as number,
			};
		}
	}

	create(data): Promise<TEntity> {
		return new Promise((resolve, reject) => {
			delete data._coretype;
			this.dbModel.create(data, (error, resObj) => {
				if(error) reject(error);
				else {
					resolve((resObj as any)._doc);
				}
			});
		});
	}

	update(condition: db.FilterQuery<TEntity>, obj: Partial<TEntity>): Promise<TEntity> {
		return new Promise((resolve, reject) => {
			const cp = { ...obj };
			this.dbModel.updateMany(condition, cp as db.UpdateQuery<TEntity>, {}, (error, res) => {
				if(error) reject(error);
				else {
					resolve(res);
				}
			});
		});
	}

	updateItem(obj: TEntity): Promise<TEntity> {
		if(!obj._id) throw new Error("Object should be created!");
		return new Promise((resolve, reject) => {
			const cp = Object.assign({}, obj);

			/* Prepare this inside DbObject
			delete cp._id;
			delete cp._coretype;
			delete cp._hash;
			*/

			this.dbModel.updateOne(
				{ _id: obj._id } as any,
				cp,
				{},
				error => {
					if(error) reject(error);
					else {
						this.dbModel.find(
                            { _id: obj._id } as any,
                            (error, res: any[]) => {
                                if(error) reject(error);
                                else {
									/* This is should be move to DbObject
                                    Object.assign(res[0]._doc, {
                                        _hash: prepareHash(res[0]._doc),
                                        _coretype: this.name
                                    });
									*/
                                    resolve(res[0]._doc);
                                }
						    }
                        );
					}
				}
			);
		});
	}
}

const controllers: { [key: string]: IEntityController<any> } = {};

export const reconnect = async () => {
	try {
		const { dbHost, dbUser, dbPassword, database } = config;
		const link = `mongodb://${dbUser}:${dbPassword}@${dbHost}/${database}`;
		const res = await db.connect(link, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
	} catch (error) {
		console.log('Connection failed', config.dbUser, config.dbPassword);
		console.error(error);
	}
};

export function DbModel({ model, owner }: {
    model: string,
	owner?: IEntityController<ICommonEntity>
}) {
    return <TEntityCreator extends new(...args: any[]) => IEntityController<any>>(base: TEntityCreator) => {
        return class extends base {

			static modelName: string = model;

			get owner() {
				return owner;
			}

            get model() {
                return DbBridge.getBridge(model);
            };

            constructor(...args: any[]) {
                super(args);
				controllers[model] = this;
            }

            showhide() {}
        }
    }
}