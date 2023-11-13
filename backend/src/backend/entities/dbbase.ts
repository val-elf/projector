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

	protected static fixIds(item: (TObjectId | string)[] | Object): ObjectId[] | Object | undefined {
		if(item === null || item === undefined) return undefined;

		if (Array.isArray(item)) {
			return item.map(aitem => aitem instanceof ObjectId || !ObjectId.isValid(aitem) ?
				aitem :
				new ObjectId(aitem)
			);
		}

		Object.keys(item).forEach(prp => {
			if(prp.match(/(^|\.)_/) && isString(item[prp]) && ObjectId.isValid(item[prp])) {
				item[prp] = new ObjectId(item[prp]);
			} else if(Array.isArray(item[prp]) || isObject(item[prp])) {
				item[prp] = this.fixIds(item[prp]);
			}
		});
		return item;
	}

	public prepareArguments(args: any[]) {
		return args.map(a => DbObjectBase.fixIds(a));
	}
}

type TOwnerFullDefinition = { id: TObjectId; type: string };
export type TOwnerIdentity = TObjectId | TOwnerFullDefinition;

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

	protected setOwners(ownerIds: TOwnerIdentity | TOwnerIdentity[]) {
		if (!isArray(ownerIds)) ownerIds = [(ownerIds as TOwnerIdentity)];
		this.model.transaction.data.ownerIds = [...(ownerIds as TOwnerIdentity[])];
		// console.log('Set owners', ownerIds, this.model.transaction, this.model.modelName);
	}

	protected prepareOwners(owners: TOwnerIdentity[], useComplexOwners): any {
		const result = owners.reduce((acc, owner) => {
			const baseName = useComplexOwners ? '__owners._id' : '__dbobject._owners';
			const obj = {};
			if (typeof owner === 'string') {
				Object.assign(obj, { [baseName]: { $in: [new ObjectId(owner)] } });
			} else if (owner?.constructor?.name === 'ObjectId') {
				Object.assign(obj, { [baseName]: { $in: [owner] } });
			} else if (owner.id || (owner as any).type) {
				const fullIdentity: TOwnerFullDefinition = owner as TOwnerFullDefinition;
				if (fullIdentity.id) {
					Object.assign(obj, {
						[baseName]: { $in: [new ObjectId(fullIdentity.id)] },
						'__owners.type': { $in: [fullIdentity.type] },
					});
				} else {
					Object.assign(obj,{
						'__owners.type': {
							$nin: [fullIdentity.type]
						}
					});
				}
			}

			return {
				...acc,
				...obj,
			}
		}, {});
		return result;
	}

	public async preCreate(item: T & { tags?: string[] }, owners?: (ObjectId | string)[]): Promise<T> {
		const dbModel = DbBridge.getBridge<IDbObject, IDbObject>('dbobjects');
		const user = await this.getCurrentUser();
		const { ownerIds } = this.model.transaction.data;
		const fixedOwners = DbObjectBase.fixIds([user._id, ...(owners ?? []), ...(ownerIds ?? [])]);
		// console.log('OWNERS:', owners, this.model.transaction);
		const dbObject: Partial<IDbObject> = {
			type: this.model.modelName,
			status: EDbObjectStatuses.normal,
			_created: {
				_dt: new Date(),
				_user: user._id,
			},
			_owners: fixedOwners as ObjectId[],
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
		const { ownerIds } = this.model.transaction.data;
		owners = [...(owners ?? []), ...(ownerIds ?? [])];
		const useComplexOwners = owners?.some(owner => typeof owner !== 'string' || !ObjectId.isValid(owner)) ?? false;
		const aggregate: any[] = [
			{
				$lookup: {
					from: 'dbobjects',
					localField: '_id',
					foreignField: '_id',
					as: '__dbobject'
				}
			},
			{
				$unwind: {
					path: '$__dbobject',
					preserveNullAndEmptyArrays: true,
				}
			},
			(useComplexOwners ? {
				$lookup: {
					from: 'dbobjects',
					localField: '__dbobject._owners',
					foreignField: '_id',
					as: '__owners'
				}
			} : undefined),
			{
				$addFields: {
					'_created': '$__dbobject._created',
					'_updated': { '$cond': [ '$__dbobject._updated', '$__dbobject._updated', '$__dbobject._created'] },
				},
			}
		].filter(a => a);

		const { includeOwner, showCreateDate, showUpdateDate } = this.model.transaction;
		const $match = {
			'__dbobject._deleted': { $exists: false }
		};
		aggregate.push({ $match });

		if (owners.length) {
			Object.assign($match, this.prepareOwners(owners, useComplexOwners));
		}

		const projection = {
			__owners: 0,
			...(!showCreateDate ? { '_created': 0 } : {}),
			...(!showUpdateDate ? { '_updated': 0 } : {}),
			...(!includeOwner ? { '__dbobject': 0 } : {}),
		}

		const result = {
			$aggregate: aggregate,
			$projection: projection,
		};

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