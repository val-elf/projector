import { TsArrowFunction } from '../ts-arrow-function';
import { TsComment } from '../ts-comment';
import { TsEntity, ETsEntityTypes } from './model'
import { TsParserBase } from './ts-parser-base'

export class TsValueParser extends TsParserBase {

    private collectedUnknownsEntities = '';
    private collectedEntities: { entity: string, entityType: ETsEntityTypes }[] = [];

    protected analyseEntity(entity: string, entityType: any): TsEntity | ETsEntityTypes {
        const entityResult = super.analyseEntity(entity, entityType);
        if (entityResult) return entityResult;

        switch(entityType) {
            case ETsEntityTypes.Async:
                this.attributes.isAsync = true;
                this.index += entity.length;
                break;
            case ETsEntityTypes.ArrowFunction:
                const prevdefinition = this.collectedUnknownsEntities;
                this.collectedUnknownsEntities = '';
                return new TsArrowFunction(this, prevdefinition, this.collectedEntities);
            case ETsEntityTypes.Argument:
                this.collectedEntities.push({ entity, entityType });
                this.index += entity.length;
                break;
            default:
                this.collectedUnknownsEntities += entity + ' ';
                this.index += entity.length;
                return;
        }
    }
}