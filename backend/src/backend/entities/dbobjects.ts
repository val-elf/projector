import { EntityControllerBase, IEntityController } from '../core/entity-processor';
import { DbBridge, DbModel } from '../core/db-bridge';
import { ICommonEntity, TFindList, TFindListResult, TObjectId } from '../core/models';
import { IDbObject, IEntityList, IFilterOptions, IUser } from './models/db.models';
import { getToken, isArray, isObject, isString, objId, prepareHash } from './utils';
import { Service } from '~/network/service';

const USER_LOGOUT_MESSAGE = "User must be authorized";

export interface IUserManagement extends IEntityController<any>{
	getUserBySession(sessionId): Promise<IUser>;
}

export abstract class DbObjectBase extends EntityControllerBase {
	private static onceSession: string;

	public static getSession() {
		const token = getToken(Service.instance.request);
		return token;
	}

	private static getCurrentSession(token: string) {
		const session = this.onceSession || token;
		if (this.onceSession) delete this.onceSession;
		return session;
	}

	private static _user: IUser;

	private static async _getCurrentUser(throwIfNotFound: boolean): Promise<IUser> {
		if (this._user) {
			return this._user;
		}
		const app = Service.instance;
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
			const rsession = request.session as any;
			if(rsession && rsession.id === sessionId && rsession.user){
				return (request.session as any).user;
			}
			try{
				const user = await userController.getUserBySession(sessionId);
				if(user) {
					if(rsession) {
						rsession.user = user;
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
			throwError();
		}
	}

	public static async getCurrentUser(throwIfNotFound: boolean): Promise<IUser>{
		throwIfNotFound = throwIfNotFound === undefined || throwIfNotFound;
		this._user = await this._getCurrentUser(throwIfNotFound);
		return this._user;
	}

	public static setOnceSession = function(session: string) {
		this.onceSession = session;
	}


	public async getCurrentUser(): Promise<IUser> {
		return await DbObjectBase.getCurrentUser(true);
	}

	public async deleteItem<TEntity extends ICommonEntity>(
        itemId: TObjectId,
		user: IUser
    ): Promise<TEntity> {
		const { _id } = user;
		const userId = typeof(_id) === "string" ? new objId(_id) : _id;
		const filterQuery = { _id: itemId };
		const res = await this.model.update(
			filterQuery,
			{
				_deleted: {
					_dt: new Date(),
					_user: userId
				}
			} as unknown as Partial<TEntity>);
		return res;
	}

	private prepare = <T extends ICommonEntity>(item: T) => ({
		...item,
		_hash: prepareHash(item),
		_coretype: this.model.modelName
	});

	public registryModel() {
		this.model.itemLoad$.subscribe(this.prepare);

		this.model.itemUpdate$.subscribe(item => {
			const { _coretype, _hash, ...rest } = item;
			return rest;
		});
	}
}

@DbModel({ model: 'dbobjects' })
export class DbObjectController extends DbObjectBase {
	readonly model: DbBridge<IDbObject>

	create() {
		// const user = this.app.getContext('user') as IUser;
	}

	constructor(app: Service) { super(app);	}

	public async getDbObject(itemId: TObjectId) {
		return await this.model.getItem(itemId);
	}

	protected async update(item: IDbObject) {
		return await this.model.update({ _id: item._id }, item);
	}

	protected async updateItem(item: IDbObject) {
		return await this.model.updateItem(item);
	}

	public static normalize<T extends ICommonEntity>(item: T, user: IUser): T {
		let newItem: any = {};
		const { _id } = user ?? { _id: undefined };
        const userId = typeof(_id) === "string" ? new objId(_id): _id;

		if(!item._id){
			newItem = {
				_create: {
					_dt: new Date()
				},
				_update: {
					_dt: new Date()
				},
				...item
			};
			if(_id) {
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
			if(_id) newItem._update._user = userId;
		}

		//normalize all Ids
		this.fixIds(newItem);
		return newItem as unknown as T;
	}

	private static fixIds(item) {
		if(item === null || item === undefined || typeof(item) !== "object") return item;

		Object.keys(item).forEach(prp => {
			if(prp.match(/(^|\.)_/) && isString(item[prp])) {
				try{
					item[prp] = new objId(item[prp]);
				} catch(exp){ }
			} else if(isArray(item[prp])) {
				item[prp] = item[prp].map(aitem => this.fixIds(aitem));
			} else if (isObject(item[prp])) {
				item[prp] = this.fixIds(item[prp]);
			}
		});
		return item;
	}
}

export class DbObjectAncestor<T extends ICommonEntity> extends DbObjectBase {
	get model(): DbBridge<T> {
		return null;
	}

	constructor(app: Service) {
		super(app);
	}

	protected preapareItemsList<T extends ICommonEntity>(source: TFindListResult<T>): IEntityList<T> | { count: number }{
		const counter:{ count: number } = (source as unknown as { count: number });
		if (counter) return counter;

		const list = source as TFindList<T>;
		const options = list.options as unknown as IFilterOptions;
		/* this is should be moved to DbObject */
		const items = list.result;
		return {
			data: items,
			_: {
				total: options.total as number,
				page: options.skip !== undefined ? (Math.floor(options.skip / options.limit) + 1) : 1,
				offset: options.skip,
				count: items.length,
				more: options.total > options.skip + options.limit
			}
		};
	}
}