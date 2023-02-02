import { Service } from '../../network/service';
import { DbBridge } from './db-bridge';
import { ICommonEntity } from './models';

export interface IEntityController<T extends ICommonEntity> {
	model: DbBridge<T>;
	registryModel(): void;
}

export abstract class EntityControllerBase implements IEntityController<any> {
    public abstract get model(): DbBridge<any>;
	public abstract registryModel();

	public static modelName: string;

	constructor(public app: Service) { }


	setSession(session) {
		// this.app.setOnceSession(session);
		return this;
	}
}

