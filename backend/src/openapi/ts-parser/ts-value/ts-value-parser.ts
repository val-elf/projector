import { TsArrowFunction } from '../ts-functions/ts-arrow-functions/ts-arrow-function';
import { ETsEntitySymbolTypes, TReadEntityResult } from '../ts-readers/model'
import { TsParserBase } from '../ts-readers/ts-parser-base'
import { ITsEntity } from '../model';

export class TsValueParser extends TsParserBase {

    private collectedUnknownsEntities = '';
    private collectedEntities: { entity: string, entityType: ETsEntitySymbolTypes }[] = [];

    protected analyseEntity(entity: string, entityType: ETsEntitySymbolTypes): TReadEntityResult {
        const entityResult = super.analyseEntity(entity, entityType);
        if (entityResult) return entityResult as ITsEntity;

        switch(entityType) {
            case ETsEntitySymbolTypes.Async:
                this.attributes.isAsync = true;
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.ArrowFunction:
                const prevdefinition = this.collectedUnknownsEntities;
                this.collectedUnknownsEntities = '';
                return new TsArrowFunction(this, prevdefinition, this.collectedEntities);
            case ETsEntitySymbolTypes.ArgumentStart:
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