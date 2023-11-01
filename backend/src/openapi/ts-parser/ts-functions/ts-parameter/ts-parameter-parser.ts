import { TsTypeService } from '~/openapi/services/ts-type.service';
import { ITsEntity, ITsParameter } from '../../model';
import { TsParserBase } from '../../ts-readers';
import { ETsEntitySymbolTypes, ITsParser } from '../../ts-readers/model';
import { ITsType } from '../../ts-types';
import { TsTypeParser } from '../../ts-types/ts-type/parsers/ts-type-parser';
import { TsParameter } from './ts-parameter';
import { TsParametersList } from './ts-parameters-list';

enum EReadMode {
    Initial = 'initial',
    ReadingType = 'reading-type',
}

export class TsParametersParser extends TsParserBase {

    public static readParameters(parent: ITsParser): TsParametersList {
        try {
            console.group('Starting Parameters Reading');
            const parser = new TsParametersParser(parent);
            const parameters = parser.readParameters();
            const result = new TsParametersList();
            result.addParameters(parameters);
            return result;
        } finally {
            console.groupEnd();
        }
    }

    private readParameters(): ITsParameter[] {
        const result: ITsParameter[] = [];
        while(true) {
            this.currentParameterDraft = {
                name: '',
                type: TsTypeService.Any,
                isOptional: false,
                threeDots: false,
            };
            const entity = this.readEntity() as ITsParameter;
            if (!entity) break;
            result.push(entity);
        }
        return result;
    }

    private readMode: EReadMode = EReadMode.Initial;

    private currentParameterDraft: {
        name: string;
        type: ITsType;
        isOptional?: boolean;
        threeDots: true | false;
    };

    protected override analyseEntity(entity: string, entityType: ETsEntitySymbolTypes): ITsEntity {
        let eResult = super.analyseEntity(entity, entityType);
        if (eResult) return eResult;

        // console.log('Reading parameter entity', entity, entityType);
        switch(entityType) {
            case ETsEntitySymbolTypes.EntityName:
                this.index += entity.length;
                if (this.readMode === EReadMode.ReadingType) {
                } else {
                    this.currentParameterDraft.name = entity;
                }
                break;
            case ETsEntitySymbolTypes.TypeDefinition: {
                    this.index += entity.length;
                    const type = TsTypeParser.readType(this);
                    const { name, isOptional, threeDots } = this.currentParameterDraft;
                    return new TsParameter(name, type, isOptional, threeDots);
                }
            case ETsEntitySymbolTypes.Optional:
                this.index += entity.length;
                this.currentParameterDraft.isOptional = true;
                break;
            case ETsEntitySymbolTypes.ArgumentStart:
                // parameters start reading
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.Rest:
                this.currentParameterDraft.threeDots = true;
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.ArgumentEnd:
                // parameters end reading
                this.index += entity.length;
                return null;
            case ETsEntitySymbolTypes.Comma: {
                    const { name, isOptional, type, threeDots } = this.currentParameterDraft;
                    this.index += entity.length;
                    return new TsParameter(name, type, isOptional, threeDots);
                }
        }
    }

    protected override defineEntityType(entity: string): ETsEntitySymbolTypes | undefined {
        const entityType = super.defineEntityType(entity);
        if (entityType) return entityType;

        if (entity === ':') return ETsEntitySymbolTypes.TypeDefinition;
        if (entity === ')') return ETsEntitySymbolTypes.ArgumentEnd;
        if (entity === '?') return ETsEntitySymbolTypes.Optional;
        if (entity === ',') return ETsEntitySymbolTypes.Comma;
        if (entity === '...') return ETsEntitySymbolTypes.Rest;
        if (/^\w+$/.test(entity.trim())) return ETsEntitySymbolTypes.EntityName;
    }
}