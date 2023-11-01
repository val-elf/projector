import { TsCodeBlock } from "../../ts-code-block/ts-code-block";
import { TsCodeBlockParser } from "../../ts-code-block/ts-code-block-parser";
import { TsParserBase } from "../../ts-readers";
import { ETsEntitySymbolTypes, TReadEntityResult } from "../../ts-readers/model";
import { TsTypeParser } from "../../ts-types/ts-type/parsers/ts-type-parser";
import { TsExpressionParser } from "../ts-expressions/parsers/ts-expression-parser";
import { TsParametersParser } from "../ts-parameter";
import { TsArrowFunction } from "./ts-arrow-functions/ts-arrow-function";
import { TsFunction } from "./ts-function";

class TsFunctionImpl extends TsFunction {}

export class TsFunctionParser extends TsParserBase {
    public static readFunction(parser: TsParserBase): TsFunction {
        try {
            console.group('Read function');
            const functionParser = new TsFunctionParser(parser);
            return functionParser.readFunction();
        } finally {
            console.groupEnd();
        }
    }

    private readFunction(): TsFunction {
        const container = { result: new TsFunctionImpl('') };
        return this.readEntity(container) as TsFunction;
    }

    private mode: 'initial' | 'body-reading';

    protected analyseEntity(entity: string, entityType: ETsEntitySymbolTypes, container: { result: TsFunctionImpl }): TReadEntityResult {
        const { result } = container;
        // console.log('Function parser process: ', entity, entityType);
        switch(entityType) {
            case ETsEntitySymbolTypes.Async:
                this.index += entity.length;
                result.isAsync = true;
                break;
            case ETsEntitySymbolTypes.Function:
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.EntityName:
                if (this.mode === 'body-reading' && result instanceof TsArrowFunction) {
                    // this meand we don't have a separate body, just expression for function (arrow function)
                    const expression = TsExpressionParser.readExpression(this);
                    result.body = TsCodeBlock.createExpressionCodeBlock(expression);
                    return result;
                } else {
                    this.index += entity.length;
                    result.name = entity;
                }
                break;
            case ETsEntitySymbolTypes.ArgumentStart:
                const parameters = TsParametersParser.readParameters(this);
                result.parameters = parameters;
                break;
            case ETsEntitySymbolTypes.TypeDefinition:
                this.index += entity.length;
                result.returnType = TsTypeParser.readType(this);
                break;
            case ETsEntitySymbolTypes.ArrowFunction:
                this.index += entity.length;
                const { result: prevFunction } = container;
                container.result = new TsArrowFunction(prevFunction.name, prevFunction.parameters, prevFunction.returnType);
                this.mode = 'body-reading';
                break;
            case ETsEntitySymbolTypes.OpenBrace:
                const functionBody = TsCodeBlockParser.readCodeBlock(this);
                result.body = functionBody;
                return result;
        }
        return;
    }

    protected defineEntityType(entity: string): ETsEntitySymbolTypes {
        const result = super.defineEntityType(entity);
        if (result) return result;

        if (entity === '=>') return ETsEntitySymbolTypes.ArrowFunction;
        if (this.isEntityName(entity)) return ETsEntitySymbolTypes.EntityName;

    }
}