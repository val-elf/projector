import { TsType } from '../ts-type';
import { ETsEntitySymbolTypes } from '../../ts-readers/model';
import { TsParserBase } from '../../ts-readers/ts-parser-base';
import { TsValueParser } from '../../ts-value/ts-value-parser';
import { ITsEntity } from '../../model';

export class TsPropertyParser extends TsParserBase {
    public readonly propertyType: TsType;
    public readonly propertyValue: ITsEntity;

    constructor(reader: TsParserBase) {
        super(reader);
        console.log('\nLastEntity', this.lastEntity);
        if (this.lastEntity.entityType === ETsEntitySymbolTypes.TypeDefinition) {
            this.propertyType = this.readPropertyType();
            const { entityType } = this.readEntityFromCode() ?? {};
            if (entityType === ETsEntitySymbolTypes.Assignment) {
                this.propertyValue = this.readPropertyValue();
            }
        }
    }

    private readPropertyType(): TsType | null {
        return new TsType(this);
    }

    private readPropertyValue(): ITsEntity | undefined {
        const valueReader = new TsValueParser(this);
        return valueReader.readEntity() as ITsEntity | undefined;
    }
}