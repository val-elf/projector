import { EntityControllerBase } from '../core/entity-processor';
import { DbBridge, DbModel } from '../core/db-bridge';
import { ICommonEntity, TFindList, TFindListResult, TObjectId } from '../core/models';
import { IDbObject, IEntityList, IFilterOptions, IUser } from './models/db.models';
import { isArray, isObject, isString, objId, prepareHash } from './utils';
import { Service } from '~/network/service';

export class DbObjectBase extends EntityControllerBase {
	get user(): IUser {
		const user = this.user;
		return {
			_id: '',
			_coretype: 'users',
			_hash: '',
			_create: { _dt: '', _user: '' },
			login: '',
			password: '',
			email: '',
			status: 'normal',
			roles: [],
		};
	}

	public async deleteItem<TEntity extends ICommonEntity>(
        itemId: string,
    ): Promise<TEntity> {
		const { _id } = this.user;
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
}

@DbModel({ model: 'dbobjects' })
export class DbObjectController extends DbObjectBase {
	model: DbBridge<IDbObject>

	create() {
		// const user = this.app.getContext('user') as IUser;
	}

	constructor(public app: Service) { super(app);	}

	public async getDbObject(itemId: TObjectId) {
		return await this.model.getItem(itemId);
	}

	protected async update(item: IDbObject) {
		return await this.model.update({ _id: item._id }, item);
	}

	protected async updateItem(item: IDbObject) {
		return await this.model.updateItem(item);
	}

	public normalize<T extends ICommonEntity>(item: T): T {
		let newItem: any = {};
		const { _id } = this.user ?? { _id: undefined };
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
		DbObjectController.fixIds(newItem);
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
	model: DbBridge<T>;

	constructor(public app: Service) {
		super(app);
	}

	protected get dbObject(): DbObjectController {
		return this.owner as unknown as DbObjectController;
	};

	protected preapareItemsList<T extends ICommonEntity>(source: TFindListResult<T>): IEntityList<T> | { count: number }{
		const counter:{ count: number } = (source as unknown as { count: number });
		if (counter) return counter;
		const list = source as TFindList<T>;
		const options = list.options as unknown as IFilterOptions;
		/* this is should be moved to DbObject */
		const items = list.result.map(item => ({
			...item,
			_hash: prepareHash(item),
			_coretype: this.model.modelName
		}));
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