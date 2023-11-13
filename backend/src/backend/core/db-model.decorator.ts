import { DbBridge, controllers } from './db-bridge';
import { IEntityController } from './entity-processor';

export function DbModel({ model, owner }: {
    model?: string,
	owner?: {
		model: string,
		foreignField: string,
	}
}) {
    return <TEntityCreator extends new(...args: any[]) => IEntityController<any, any>>(base: TEntityCreator) => {
        return class extends base {

			static modelName: string = model;
			_model: DbBridge<any, any>;
			_owner;

            get model() {
                return this._model;
            };

            constructor(...args: any[]) {
				super(...args);
				if(owner) {
					this._owner = owner;
				}
				if (model) {
					controllers[model] = this;
					this._model = DbBridge.getBridge(model, undefined, this._owner);
					this.registryModel();
				}
            }
        }
    }
}