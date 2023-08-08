import * as db from "mongoose";
import { config as outerConfig } from "../../config";
import { ICommonEntity, TFindListResult, TObjectId } from './models';
import { IEntityController, IPreselectResult } from './entity-processor';

export const controllers: { [key: string]: IEntityController<any> } = {};

function TransactionMethod() {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value;
		descriptor.value = async function (...args: any[]) {
			try {
				// console.log('RUN TRANSACTION ------------------------------------', this.modelName, propertyKey);
				const controller = controllers[this.modelName];
				if (controller) {
					args = controller.prepareArguments(args);
				}
				return await originalMethod.apply(this, args);
			} finally {
				// console.log('FINISH TRANSACTION', this.modelName, propertyKey);
				this.transactionOptions = undefined;
			}
		}
	}
}

export interface ITransactionOptions {
	includeOwner?: boolean;
	showUpdateDate?: boolean;
	showCreateDate?: boolean;
	data: { [key: string]: any };
}

class Subject<T> {
	private subscribers: ((item: T) => T)[] = [];

	next(item: T) {
		return this.subscribers.reduce((res, cb) => cb(res), item);
	}

	subscribe(cb: (item: T) => T) {
		this.subscribers.push(cb);
	}
}

export const reconnect = async (config = outerConfig) => {
	try {
		const { dbHost, dbUser, dbPassword, database } = config;
		const link = dbUser ? `mongodb://${dbUser}:${dbPassword}@${dbHost}/${database}` : `mongodb://${dbHost}/${database}`;
		db.set('strictQuery', true);
		return await db.connect(link);
	} catch (error) {
		console.error(error);
	}
};

export class DbBridge<TEntity extends ICommonEntity> {
	private dbModel: db.Model<TEntity, {}, {}>;
	private name: string;
	private owner?: { model: string, foreignField: string };

	public get modelName(): string { return this.name; }
    private static _models: { [key: string]: DbBridge<any> } = {};

	private transactionOptions?: ITransactionOptions;

	public itemUpdate$: Subject<Partial<TEntity>> = new Subject();
	public itemLoad$: Subject<TEntity> = new Subject();

	public get transaction(): ITransactionOptions {
		if (!this.transactionOptions) {
			this.transactionOptions = { data: [] };
		}
		return this.transactionOptions;
	}

	public static get models() {
		if (!this._models) this._models = {};
		return this._models;
	}

	private constructor(name, schema?: db.Schema, owner?: { model: string, foreignField: string }) {
		this.name = name;
		this.owner = owner;
		this.dbModel = db.model<TEntity>(name, schema, name);
	}

	public static getBridgeByType(e: new () => IEntityController<ICommonEntity>) {
		const modelName: string = (e as any).modelName;
		return this.getBridge(modelName);
	}

	public static getBridge<TEntity extends ICommonEntity>(
        modelName: string,
        schema?: db.Schema,
		owner?: {
			model: string,
			foreignField: string,
		}
    ): DbBridge<TEntity> {
		schema = schema || new db.Schema({}, { strict: false });
		if(this.models[modelName]) return this.models[modelName];
		const model = new DbBridge<TEntity>(modelName, schema, owner);
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
		const src = { ...byDefault, ...source };
		const meta: any = {};
		const { count: sCount, page: sPage, offset: sOffset, sort: sSort, dir } = src;
		const count = sCount ? Number(sCount) : undefined;
		const page = sPage ? Number(sPage) : undefined;
		const offset = sOffset ? Number(sOffset) : undefined;

		if(src.sort){
			meta.sort = {};
			if(typeof(sSort) === "string")
				meta.sort[sSort] = dir === "desc" ? -1 : 1;
			else
				meta.sort = sSort;
		} else meta.sort = { '_updated._dt': -1 }

		if(offset)
			meta.skip = offset;
		else if(page && count)
			meta.skip = ((page > 0 ? page : 1) - 1) * count;

		if(count)
			meta.limit = count;
		return meta;
	}

	/*eval(func, args) {
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
	}*/

	private prepareAggregation(
		condition?: any,
		projection?: any,
		additionals?: IPreselectResult
	) {
		const aggregations = [...(additionals?.$aggregate ?? [])];

		condition = {
			...(condition ?? {}),
			...(additionals.$match ?? {}),
		}

		projection = {
			...(projection ?? {}),
			...(additionals.$projection ?? {}),
		};

		aggregations.push({ $match: condition });

		if (Object.keys(projection).length) {
			aggregations.push({ $project: projection });
		}

		// console.log(`A::: ${this.modelName}:`, aggregations);
		return aggregations;
	}

	public async getItem(itemId: TObjectId, options?: { [key: string]: string | number | boolean | null | undefined }): Promise<TEntity | undefined> {
		const results = await this.find({ _id: itemId }, options);
		return results.length && results[0] || undefined;
	}

	@TransactionMethod()
	public async find(condition?: any, projection?: any): Promise<TEntity[]> {
		const controller = controllers[this.modelName];
		const additionals = controller && controller.preSelect ? await controller.preSelect() : {};
		const aggregations = this.prepareAggregation(condition, projection, additionals);
		const result = await this.dbModel.aggregate(aggregations);

		const entities = result.map(i => this.itemLoad$.next(i));
		return entities;
	}

	@TransactionMethod()
	public async getCountOf(condition): Promise<number> {
		const controller = controllers[this.modelName];
		const additionals = controller && controller.preSelect ? await controller.preSelect() : {};
		const aggregations = this.prepareAggregation(condition, {}, additionals);
		return (await this.dbModel.aggregate([
			...aggregations,
			{
				$count: 'count'
			}
		]))[0]?.count;
	}

	@TransactionMethod()
	public async findList(
		condition: any = {},
		projection?: any,
		meta?: any,
	): Promise<TFindListResult<TEntity>> {
		// pagination finding
		const res: { data?: TEntity[], count?: number } = {};
		const controller = controllers[this.modelName];
		const additionals = controller?.preSelect ? (await controller.preSelect()) : {}

		const aggregations = this.prepareAggregation(condition, projection, additionals);

		const onlyCount = meta?.totalCount === 'true';
		const queryOptions = DbBridge.prepareMetadata(meta);

		res.count = (await this.dbModel.aggregate([
			...aggregations,
			{ $count: 'count' }
		]))[0]?.count ?? 0;

		if (!onlyCount) {

			const paginations = [
				queryOptions.sort ? { $sort: queryOptions.sort } : undefined,
				queryOptions.skip ? { $skip: queryOptions.skip } : undefined,
				queryOptions.limit ? { $limit: queryOptions.limit } : undefined,
			].filter(i => i);

			res.data = await this.dbModel.aggregate<TEntity>([
				...aggregations,
				...paginations,
			]);
		}

		if (!onlyCount) {
			const result = res.data;
			const entities = result.map(i => this.itemLoad$.next(i));
			return { result: entities, options: { total: res.count } };
		} else {
			return {
				count: res.count,
			};
		}
	}

	@TransactionMethod()
	public async create(data: Partial<TEntity>): Promise<TEntity> {
		let cp = { ...data };
		const controller = controllers[this.modelName];

		if (controller?.preCreate) {
			cp = await controller.preCreate(cp);
		}
		const created = await this.dbModel.create(cp);
		const item =this.itemLoad$.next(created.toObject() as TEntity);
		return item;
	}

	@TransactionMethod()
	public async update(condition: db.FilterQuery<TEntity>, obj: Partial<TEntity>): Promise<TEntity> {
		let cp = { ...obj };
		const controller = controllers[this.modelName];
		if (controller?.preUpdate) {
			// making preUpdate operations
			cp = await controller.preUpdate(cp);
		}
		// remove all extra fields
		this.itemUpdate$.next(cp as TEntity);
		const res = await this.dbModel.updateMany(condition, cp as db.UpdateQuery<TEntity>, {});
		return res[0];
	}

	@TransactionMethod()
	async updateItem(item: Partial<TEntity>): Promise<TEntity> {
		if(!item._id) throw new Error("Object should be exist!");

		let cp = { ...item };

		const controller = controllers[this.modelName];
		if (controller?.preUpdate) {
			// making preUpdate operations
			cp = await controller.preUpdate(cp);
		}
		// remove all extra fields
		this.itemUpdate$.next(cp);

		const result = await this.dbModel.updateOne(
			{ _id: cp._id } as any,
			cp as any
		);

		const res = await this.find({ _id: item._id } as any);
		return res[0];
	}
}

