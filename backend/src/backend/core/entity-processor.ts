import { Service } from '../../network/service';
import { DbBridge } from './db-bridge';
import { ICommonEntity } from './models';

export interface IEntityController<T extends ICommonEntity> {
	model: DbBridge<T>;
	owner?: IEntityController<ICommonEntity>;
}

export abstract class EntityControllerBase implements IEntityController<any> {
    model: DbBridge<any>;
	owner?: IEntityController<ICommonEntity>;

	public static modelName: string;

	constructor(public app: Service) { }

	setSession(session) {
		// this.app.setOnceSession(session);
		return this;
	}
}

