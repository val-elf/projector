import { TsEntity } from "~/openapi/ts-parser/model";
import { ETsEntityTypes } from "~/openapi/ts-parser/ts-readers/model";
import { TsClassProperty } from "./ts-class-property";
import { TsClassMethod } from "./ts-class-method";
import { TsClass } from "./ts-class-definition";

export abstract class TsClassBody extends TsEntity {

    public readonly entityType = ETsEntityTypes.ClassBody;
    protected _properties: TsClassProperty[] = [];
    protected _methods: TsClassMethod[] = [];

    public get methods(): TsClassMethod[] {
        return this._methods;
    }

    public get properties(): TsClassProperty[] {
        return this._properties;
    }

    constructor(protected owner: TsClass) {
        super('');
    }
}