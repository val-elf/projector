import { OATag } from '../../../../components';
import { IOARoute, IPathsDefinition } from '../../../../components/model';
import { ITsDecorator, ITsTagged, TsEntity } from '../../../model';
import { ETsEntityTypes } from '../../../ts-readers/model';
import { mergeDeep } from '~/openapi/utils';
import { TsClassBody } from './ts-class-body';
import { ITsType } from '../../model';
import { TsGenericsList } from '../../ts-generics-list/ts-generics-list';

/**
 * TsClass
 * reading the class definition and implementation for further extracting routes to OpenApi specification
 */
export abstract class TsClass extends TsEntity implements ITsTagged {

    // methods and properties of the class
    // type of the entity
    public readonly entityType = ETsEntityTypes.Class;
    public readonly implementsList: ITsType[] = [];
    public extendType?: ITsType;
    public genericsList: TsGenericsList;

    public classBody: TsClassBody;

    private _tag: OATag;

    // current OpenApi tag
    public get tag(): OATag {
        return this._tag;
    }

    public set tag(value: OATag) {
        this._tag = value;
    }

    public get methods() {
        return this.classBody.methods;
    }

    public get properties() {
        return this.classBody.properties;
    }

    /**
     * TsClass constructor
     * @param reader - reader to read class definition
     * @param isExport - is class exported
     * @param isAbstract - is class abstract
     * @param decorators - class decorators
     */
    constructor(
        public readonly isExport: boolean = false,
        public isAbstract: boolean = false,
        public readonly decorators: ITsDecorator[] = [],
    ) {
        super('');
    }

    public get paths(): IPathsDefinition {
        return this.methods.reduce((res, m) => mergeDeep(res, m.toOpenApi()), {});
    }

    public getRoutes(): IOARoute[] {
        return this.methods.map(m => m.definition);
    }

    public toOpenApi(): { [key: string]: any; } {
        return this.paths;
    }
}
