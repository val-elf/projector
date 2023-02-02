import * as db from "mongoose";
import { config } from "../../config";
import { ICommonEntity, IDbEntity, TFindListResult } from './models';
import { IEntityController } from './entity-processor';

class Subject<T> {
	private subscribers: ((item: T) => T)[] = [];

	next(item: T) {
		return this.subscribers.reduce((res, cb) => cb(res), item);
	}

	subscribe(cb: (item: T) => T) {
		this.subscribers.push(cb);
	}
}

export class DbBridge<TEntity extends ICommonEntity> {
	private dbModel: db.Model<TEntity, {}, {}>;
	private name: string;

	public get modelName(): string { return this.name; }
    private static _models: { [key: string]: DbBridge<any> } = {};

	public itemUpdate$: Subject<TEntity> = new Subject();
	public itemLoad$: Subject<TEntity> = new Subject();

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

	public static getNameByInstance(m: IEntityController<any>) {
		const names = Object.keys(controllers)
		return names.find(name => controllers[name] === m);
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
				const result = res.map(item => this.itemLoad$.next(item));
				resolve(result);
			});
		});
	}

	async getItem(itemId, options?: { [key: string]: string | number | boolean | null | undefined }): Promise<TEntity | undefined> {
		const results = await this.find({ _id: itemId }, options, {});
		return results.length && results[0] || undefined;
	}

	async find(...args: any[]): Promise<TEntity[]> {
		return new Promise<TEntity[]>((resolve, reject) => {
			const delCond = {_deleted: {$exists: false}}, outargs = [];

            [...args].forEach((argument, index) => {
				if (args.length === 1 || index < args.length - 1)
				outargs.push(argument);
			});

            // const options = outargs.length > 1 ? outargs[outargs.length -1] : null;

			outargs.push(async (error, res: IDbEntity<TEntity>[]) => {
				if(error){
					reject(error);
					return;
				}
				const entities = res.map(item => this.itemLoad$.next(item._doc));
				resolve(entities);
			});
			if(outargs.length) Object.assign(outargs[0], delCond);
			this.dbModel.find(...outargs);
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

	async findList(condition?: any, projection?: any, meta?: any): Promise<TFindListResult<TEntity>>
	{ // pagination finding
		const resd = [];
		const delCond = { _deleted: { $exists: false } };

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
		this.dbModel.countDocuments(condition, cbs.counter);

		if (!onlyCount) {
			this.dbModel.find(condition, projection, options, cbs.data);
		}
		const res = await Promise.all(resd) as (IDbEntity<TEntity>[] | number | Error)[];

		if(res[0] instanceof Error){
			throw res[0];
		}

		if (!onlyCount) {
			const result = (res[0] as IDbEntity<TEntity>[]);
			const entities = result.map(i => this.itemLoad$.next(i._doc));
			return { result: entities, options: { ...options, total: res[1] as number } };
		} else {
			return {
				count: res[0] as number,
			};
		}
	}

	async create(data): Promise<TEntity> {
		delete data._coretype;
		const created = await this.dbModel.create(data);
		const item =this.itemLoad$.next(created.toObject() as TEntity);
		return item;
	}

	update(condition: db.FilterQuery<TEntity>, obj: Partial<TEntity>): Promise<TEntity> {
		return new Promise((resolve, reject) => {
			const cp = { ...obj };
			this.itemUpdate$.next(cp as TEntity);
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
			const cp = { ...obj };
			this.itemUpdate$.next(cp);

			this.dbModel.updateOne(
				{ _id: obj._id } as any,
				cp as any,
				{},
				error => {
					if(error) reject(error);
					else {
						this.dbModel.find(
                            { _id: obj._id } as any,
                            (error, res: any[]) => {
                                if(error) reject(error);
                                else {
									this.itemLoad$.next(res[0])
                                    resolve(res[0]);
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
		console.error(error);
	}
};

export function DbModel({ model }: {
    model: string,
}) {
    return <TEntityCreator extends new(...args: any[]) => IEntityController<any>>(base: TEntityCreator) => {
        return class extends base {

			static modelName: string = model;
			_model: DbBridge<any>;

            get model() {
                return this._model;
            };

            constructor(...args: any[]) {
                super(args);
				controllers[model] = this;
				this._model = DbBridge.getBridge(model);
				this.registryModel();
            }

            showhide() {}
        }
    }
}