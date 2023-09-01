import { OATag } from '../components';
import { ETsEntityTypes } from './ts-readers/model';
import util from 'util';

export interface ITsTagged {
    tag?: OATag;
}

export interface ITsEntity {
    name: string;
    entityType: ETsEntityTypes;
}

export interface ITsParameters extends ITsEntity {
}

export interface ITsDecorator extends ITsEntity {
    parameters: ITsParameters[];
}

export class TsEntity implements ITsEntity {
    constructor(
        public name: string,
        public entityType: ETsEntityTypes,
    ) {}

    [util.inspect.custom](depth: number, options: any): any {
        return {
            name: this.name,
            entityType: this.entityType,
        }
    }
}

