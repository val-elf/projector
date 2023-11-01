import { ETsEntityTypes } from "../ts-parser/ts-readers/model";
import { ITsProperty } from "../ts-parser/ts-types";
import { CommonOADefinition } from "./common-oa-definition";
import { EDeclarationType, IOAProperty, OADefinition } from "./model";

export class OAProperty extends OADefinition implements IOAProperty {
    public description: string;
    public readonly type: EDeclarationType = EDeclarationType.Property;
    public readonly entityType: ETsEntityTypes = ETsEntityTypes.OADefinition;
    public readonly name: string = '';
    private _owner: ITsProperty;

    public get owner(): ITsProperty {
        return this._owner;
    }

    constructor(
        data: CommonOADefinition,
    ) {
        super(data);
        this.name = data.name;
        this.description = data.properties.description as string;
    }

    setOwner(owner: ITsProperty) {
        this._owner = owner;
    }

    toOpenApi(): { [key: string]: string | number | object; } {
        return {

        };
    }
}