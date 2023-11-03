import { ITsEntity } from '../../model';
import { ETsEntityTypes } from '../../ts-readers/model';
import { ITsGenericItem, TsGenericOwners } from './model';
import util from 'util';

export class TsGenericsList extends Array<ITsGenericItem> implements ITsEntity{

    constructor(
        protected owner: TsGenericOwners,
    ) {
        super();
        /*return new Proxy<TsGenericsList>(this, {
            get: (target, prop): TsGenericItem | keyof(TsGenericsList) => {
                if (typeof prop !== 'symbol' && !isNaN(Number(prop)) && !(prop in target)) {
                    return target._genericsList[prop];
                }
                return target[prop];
            }
        } as { get: (target: any, prop: any) => TsGenericItem | keyof(TsGenericsList) });*/
    }
    name: string = 'generic-list';
    entityType: ETsEntityTypes = ETsEntityTypes.GenericsList;

    [util.inspect.custom]() {
        const items = [...this].map(t => ({
            name: t?.name,
        }));
        return {
            type: this.entityType,
            count: this.length,
            items,
            owner: this.owner
        };
    }
}
