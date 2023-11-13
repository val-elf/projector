import { ITsArgumentsList, ITsEntity, TsEntityNamed } from "../model";
import { TsArgumentsListParser } from "../ts-functions/ts-argument/parsers/ts-arguments-list-parser";
import { TsParserBase } from "../ts-readers";
import { ETsEntitySymbolTypes, ETsEntityTypes } from "../ts-readers/model";
import { TsDecorator } from "./ts-decorator";

class TsDecoratorImpl extends TsDecorator {
}

export class TsDecoratorParser extends TsParserBase {

    public static readDecorator(parent: TsParserBase): TsDecorator {
        try {
            console.group('Read Decorator');
            const parser = new TsDecoratorParser(parent);
            return parser.readDecorator();
        } finally {
            console.groupEnd();
        }
    }

    protected readDecorator() {
        let decoratorName: string;
        let decoratorArguments: ITsArgumentsList;
        while(true) {
            const entity = this.readEntity();
            if (entity === null) break;

            switch (entity.entityType) {
                case ETsEntityTypes.EntityName:
                    decoratorName = entity.name;
                    break;
                case ETsEntityTypes.ArgumentsList:
                    decoratorArguments = entity as ITsArgumentsList;
                    break;
            }
            if (entity instanceof TsDecoratorImpl) {
                decoratorName = entity.name;
                decoratorArguments = entity.argumentsList;
                break;
            }
        }
        const result = new TsDecoratorImpl(decoratorName, decoratorArguments);
        return result;
    }

    protected analyseEntity(entity: string, entityType: ETsEntitySymbolTypes): ITsEntity {
        // we cannot read parent entities

        // console.log('Decorator reading entity', entity, entityType);
        switch(entityType) {
            case ETsEntitySymbolTypes.Decorator:
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.ArgumentStart:
                return TsArgumentsListParser.readArgumentsList(this);
            case ETsEntitySymbolTypes.ArgumentEnd:
                this.index += entity.length;
                return null;
            case ETsEntitySymbolTypes.EntityName:
                this.index += entity.length;
                return new TsEntityNamed(entity);
            default:
                return null;
        }
    }

    protected defineEntityType(entity: string): ETsEntitySymbolTypes {
        const result = super.defineEntityType(entity);
        if (result) return result;

        if (entity === '@') return ETsEntitySymbolTypes.Decorator;
        if (this.isEntityName(entity)) return ETsEntitySymbolTypes.EntityName;
    }
}