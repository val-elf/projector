import { ETsEntitySymbolTypes, ITsParser, TReadEntityResult } from '../../../../ts-readers/model';
import { TsParserBase } from '../../../../ts-readers/ts-parser-base';
import { ITsType } from '../../../model';
import { TsTypeParser } from '../../../ts-type/parsers/ts-type-parser';
import { TsClassBody } from '../ts-class-body';
import { TsClass } from '../ts-class-definition';
import { TsClassBodyParser } from './ts-class-body-parser';
import { ITsDecorator } from '~/openapi/ts-parser/model';
import { TsClassImplementsListParser } from './ts-class-implements-list-parser';
import { TsGenericsArgumentsListParser } from '../../../ts-generics-list/parsers/ts-generics-arguments-list-parser';

class TsClassImpl extends TsClass {
    constructor(isExport: boolean, isAbstract: boolean, decorators?: ITsDecorator[]) {
        super(isExport, isAbstract, decorators);
    }
}
export class TsClassParser extends TsParserBase {

    constructor(
        parent: ITsParser,
    ) {
        super(parent);
    }

    // private entityName: string;

    public static readClassDefinition(
        parent: ITsParser,
        isExport: boolean = false,
        isAbstract: boolean = false,
        decorators?: ITsDecorator[],
    ): TsClass {
        try {
            console.group('Read Class Definition');
            const parser = new TsClassParser(parent);
            return parser.readClassDefinition(isExport, isAbstract, decorators);
        } finally {
            console.groupEnd();
        }
    }

    private readClassDefinition(isExport: boolean, isAbstract: boolean, decorators?: ITsDecorator[]): TsClass {
        const result = new TsClassImpl(isExport, isAbstract, decorators);
        while(true) {
            const entity = this.readEntity(result);
            if (entity === null) break;
            if (entity instanceof TsClassBody) {
                result.classBody = entity;
                break;
            }
        }
        return result;
    }

    protected analyseEntity(entity: string, entityType, result: TsClassImpl): TReadEntityResult {
        const entityResult = super.analyseEntity(entity, entityType);
        if (entityResult) return entityResult;

        // console.log('Reading class definition entitiy', entity, entityType);
        switch(entityType) {
            case ETsEntitySymbolTypes.Abstract:
                this.index += entity.length;
                result.isAbstract = true;
                break;
            case ETsEntitySymbolTypes.EntityName:
                this.index += entity.length;
                result.name = entity;
                break;
            case ETsEntitySymbolTypes.Extends:
                this.index += entity.length;
                result.extendType = TsTypeParser.readType(this, result);
                break;
            case ETsEntitySymbolTypes.Implements:
                this.index += entity.length;
                result.implementsList.push(...this.readImplementsList());
                break;
            case ETsEntitySymbolTypes.OpenBrace: {
                return TsClassBodyParser.readClassBody(this, result);
            }
            case ETsEntitySymbolTypes.GenericOpen:
                this.index += entity.length;
                const genericList = TsGenericsArgumentsListParser.getGenericsList(this, result);
                result.genericsList = genericList;
                break;
            default:
                this.index += entity.length;
                break;
        }
    }

    protected defineEntityType(entity: string): ETsEntitySymbolTypes | undefined {
        const etype = super.defineEntityType(entity);
        if (etype) return etype;
        if (entity === 'extends') return ETsEntitySymbolTypes.Extends;
        if (entity === 'implements') return ETsEntitySymbolTypes.Implements;
        if (entity === '<') return ETsEntitySymbolTypes.GenericOpen;
        if (this.isEntityName(entity)) return ETsEntitySymbolTypes.EntityName;
    }

    private readImplementsList(): ITsType[] {
        return TsClassImplementsListParser.readImplementsList(this);
    }
}