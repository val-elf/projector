import { ITsEntity } from '../../model';
import { ETsEntityTypes } from '../../ts-readers/model';
import { TsGenericOwners } from './model';
import { TsGenericItem } from './ts-generic-item';
import util from 'util';

export class TsGenericsList extends Array<TsGenericItem> implements ITsEntity{

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
        return {
            type: this.constructor.name,
            count: this.length,
            types: this.map(t => t?.itemType?.name ?? 'undefined'),
            owner: this.owner
        };
    }
}
