import { ObjectId } from 'mongodb';
import QueryString from 'qs';

import { Service, service } from '~/network';
import { EDbObjectStatuses, IDbObject, IFilterOptions, IUser } from './models';
import { getToken, isArray, isObject, isString, prepareHash } from './utils';

import { EntityControllerBase, IEntityController } from '../core/entity-processor';
import { DbBridge, DbModel } from '../core';
import { ICommonEntity, IFindList, TObjectId } from '../core/models';
import { Tags } from './tags';

const USER_LOGOUT_MESSAGE = "User must be authorized";

export interface IUserManagement extends IEntityController<unknown, unknown>{
	getUserBySession(sessionId): Promise<IUser>;
}

export abstract class DbObjectBase<T, C> extends EntityControllerBase<T, C> {
	private static onceSession: string;

	public static getSession() {
		const token = getToken(service.request);
		return token;
	}

	private static getCurrentSession(token: string) {
		const session = this.onceSession || token;
		if (this.onceSession) delete this.onceSession;
		return session;
	}

	private static async _getCurrentUser(throwIfNotFound: boolean): Promise<IUser> {
		const app = service;
		const token = this.getSession();
		const sessionId = this.getCurrentSession(token);
		const userController: IUserManagement = DbBridge.getInstance('users');
		const { request } = app;

		const throwError = () => {
			throw {
				message: new Error(USER_LOGOUT_MESSAGE),
				code: 403
			};
		}
		if(sessionId) {
			const { session: rsession, context } = request;

			if(rsession && rsession.id === sessionId && rsession['user']){
				return rsession['user'];
			}

			if (context && context.user) return context.user as IUser;

			try{
				const user = await userController.getUserBySession(sessionId);
				context.user = user;
				if(user) {
					if(rsession) {
						rsession['user'] = user;
						// rsession.id = sessionId;
					}
					return user;
				}
			}
			catch(error){
				console.error(error);
				throwError();
			};
		}
		if(throwIfNotFound) {
			console.log('USER SESSION NOT FOUND');
			throwError();
		}
	}

	public static async getCurrentUser(throwIfNotFound: boolean): Promise<IUser>{
		throwIfNotFound = throwIfNotFound === undefined || throwIfNotFound;
		return await this._getCurrentUser(throwIfNotFound);
	}

	public static setOnceSession = function(session: string) {
		this.onceSession = session;
	}

	public async getCurrentUser(): Promise<IUser> {
		return await DbObjectBase.getCurrentUser(true);
	}

	protected normalize<T extends ICommonEntity>(item: T): T {
		let newItem: T = { ...item };
		//normalize all Ids
		this.fixIds(newItem);
		return newItem;
	}

	public async deleteItem<TEntity extends ICommonEntity>(
        itemId: TObjectId,
    ): Promise<boolean> {
		const user = await this.getCurrentUser();
		const filterQuery = { _id: itemId };
		const dbModel = DbBridge.getBridge<IDbObject>('dbobjects');
		await dbModel.update(
			filterQuery,
			{
				status: 'deleted',
				_deleted: {
					_dt: new Date(),
					_user: user._id
				}
			} as unknown as Partial<TEntity>);
		return true;
	}

	private prepareItemAfterLoading = <T extends ICommonEntity>(item: T) => {
		const { __v, ...rest } = (item as any);
		return {
			...rest,
			_hash: prepareHash(item),
			_coretype: this.model.modelName
		};
	};

	private prepareItemBeforeUpdate = <T extends ICommonEntity>(item: T) => {
		const { _coretype, _hash, ...rest } = (item as any);
		return rest;
	}

	public registryModel() {
		this.model.itemLoad$.subscribe(this.prepareItemAfterLoading);
		this.model.itemUpdate$.subscribe(this.prepareItemBeforeUpdate);
	}

	public processMetadata(metadata: QueryString.ParsedQs) {
	}

    protected fixIds(item: any) {
        return DbObjectBase.fixIds(item);
    }

	protected static fixIds(item) {
		if(item === null || item === undefined) return item;

		if (typeof item === 'string') {
			return ObjectId.isValid(item) ? new ObjectId(item) : item;
		}

		if (isArray(item)) {
			return item.map(aitem => aitem instanceof ObjectId ?
				aitem :
				this.fixIds(aitem)
			);
		}

		Object.keys(item).forEach(prp => {
			if(prp.match(/(^|\.)_/) && isString(item[prp]) && ObjectId.isValid(item[prp])) {
				item[prp] = new ObjectId(item[prp]);
			} else if(isArray(item[prp]) || isObject(item[prp])) {
				item[prp] = this.fixIds(item[prp]);
			}
		});
		return item;
	}

	public prepareArguments(args: any[]) {
		return args.map(a => DbObjectBase.fixIds(a));
	}
}

@DbModel({
	owner: {
		model: 'dbobjects',
		foreignField: '_id',
	}
})
export class DbObjectAncestor<T extends ICommonEntity, C extends ICommonEntity = T> extends DbObjectBase<T, C> {
	get model(): DbBridge<T, C> {
		return null;
	}

	constructor(app: Service) {
		super(app);
	}

	protected setOwners(ownerIds: TObjectId | TObjectId[]) {
		if (!isArray(ownerIds)) ownerIds = [(ownerIds as string)];
		this.model.transaction.data.ownerIds = [...(ownerIds as TObjectId[])];
		// console.log('Set owners', ownerIds, this.model.transaction, this.model.modelName);
	}

	public async preCreate(item: T & { tags?: string[] }, owners?: (ObjectId | string)[]): Promise<T> {
		const dbModel = DbBridge.getBridge<IDbObject, IDbObject>('dbobjects');
		const user = await this.getCurrentUser();
		const { ownerIds } = this.model.transaction.data;
		owners = DbObjectBase.fixIds([user._id, ...(owners ?? []), ...(ownerIds ?? [])]);
		// console.log('OWNERS:', owners, this.model.transaction);
		const dbObject: Partial<IDbObject> = {
			type: this.model.modelName,
			status: EDbObjectStatuses.normal,
			_created: {
				_dt: new Date(),
				_user: user._id,
			},
			_owners: owners,
		}
		const res = await dbModel.create(dbObject);

		// TAGS PROCESSING
		const { tags } = item;
		delete item.tags;

		if (tags && tags.length) {
			const tagOwners = [res._id];
			const tagModel = DbBridge.getInstance('tags') as unknown as Tags;
			const existingTags = await tagModel.getTagsListByNames(tagOwners, tags);
			const newTagNames = tags.filter(tag => !existingTags.find(t => t.name === tag));
			const newTags = await tagModel.createTagsBundle(tagOwners, newTagNames);
			const newTagIds = newTags.map(t => t._id);
			await dbModel.update({ _id: res._id }, { _tags: [...existingTags.map(t => t._id), ...newTagIds] });
		}

		const nitem = this.normalize(item);
		nitem._id = res._id;
		return nitem;
	}

	public async preSelect(
		item: T,
		owners?: (ObjectId | string)[]
	): Promise<{
		$match?: any,
		$aggregate?: any[],
		$projection?: any,
	}>
	{
		const aggregate = [
			{
				$lookup: {
					from: 'dbobjects',
					localField: '_id',
					foreignField: '_id',
					as: '__owner'
				}
			},
			{
				$unwind: {
					path: '$__owner',
					preserveNullAndEmptyArrays: true,
				}
			},
			{
				$addFields: {
					'_created': '$__owner._created',
					'_updated': { '$cond': [ '$__owner._updated', '$__owner._updated', '$__owner._created'] },
				},
			}
		];

		const { includeOwner, showCreateDate, showUpdateDate } = this.model.transaction;
		const { ownerIds } = this.model.transaction.data;
		owners = [...(owners ?? []), ...(ownerIds ?? [])];
		const match = {
			'__owner._deleted': { $exists: false }
		};
		if (owners.length) {
			match['__owner._owners'] = { $in: DbObjectBase.fixIds(owners) };
		}

		const projection = {
			...(!showCreateDate ? { '_created': 0 } : {}),
			...(!showUpdateDate ? { '_updated': 0 } : {}),
			...(!includeOwner ? { '__owner': 0 } : {}),
		}

		const result = DbObjectBase.fixIds({
			$aggregate: aggregate,
			$match: match,
			$projection: projection,
		});

		return Promise.resolve(result);
	}

	public async preUpdate(item: T): Promise<T> {
		const dbModel = DbBridge.getBridge<IDbObject, IDbObject>('dbobjects');
		const user = await this.getCurrentUser();
		const dbUpdate: Partial<IDbObject> = {
			_id: item._id,
			_updated: {
				_dt: new Date(),
				_user: user._id,
			}
		}
		await dbModel.updateItem(dbUpdate);
		const nitem = this.normalize(item);
		return nitem;
	}

	protected preapareItemsList<T extends ICommonEntity>(source: IFindList<T>): IFindList<T> {
		const list = source as IFindList<T>;
		const options = list.options as unknown as IFilterOptions;
		/* this is should be moved to DbObject */
		const items = list.result;
		return {
			result: items,
			options: {
				total: options.total as number,
				page: options.skip !== undefined ? (Math.floor(options.skip / options.limit) + 1) : 1,
				offset: options.skip,
				count: items.length,
				more: options.total > options.skip + options.limit
			}
		};
	}

	public processMetadata(metadata: QueryString.ParsedQs) {
		if (metadata.owner !== undefined) {
			this.model.transaction.includeOwner = true;
		}
		if (metadata.updateDate !== undefined) {
			this.model.transaction.showUpdateDate = true;
		}
		if (metadata.createDate !== undefined) {
			this.model.transaction.showCreateDate = true;
		}
	}
}