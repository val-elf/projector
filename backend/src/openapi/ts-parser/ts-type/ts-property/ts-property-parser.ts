import { TsType } from '../ts-type';
import { ETsEntityTypes, TsEntity } from '../../ts-readers/model';
import { TsParserBase } from '../../ts-readers/ts-parser-base';
import { TsValueParser } from '../../ts-readers/ts-value-parser';

export class TsPropertyParser extends TsParserBase {
    public readonly propertyType: TsType;
    public readonly propertyValue: TsEntity | ETsEntityTypes;

    constructor(reader: TsParserBase) {
        super(reader);
        if (this.lastEntity.entityType === ETsEntityTypes.TypeDefinition) {
            this.propertyType = this.readPropertyType();
            const { entityType } = this.readEntityFromCode() ?? {};
            if (entityType === ETsEntityTypes.Assignment) {
                this.propertyValue = this.readPropertyValue();
            }
        }
    }

    private readPropertyType(): TsType | null {
        return new TsType(this);
    }

    private readPropertyValue(): TsEntity | ETsEntityTypes {
        const valueReader = new TsValueParser(this);
        return valueReader.readEntity();
    }
}