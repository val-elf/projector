import { ITsEntity, ITsExpression } from "../model";
import { TsExpressionParser } from "../ts-functions/ts-expressions/parsers/ts-expression-parser";
import { TsParserBase } from "../ts-readers";
import { ETsEntitySymbolTypes, ITsParser } from "../ts-readers/model";
import { ITsType } from "../ts-types";
import { TsTypeParser } from "../ts-types/ts-type/parsers/ts-type-parser";
import { TsVariable } from "./ts-variable";

class TsVariableImpl extends TsVariable {
    private _variableType: ITsType;
    public get variableType(): ITsType {
        return this._variableType;
    }

    public set variableType(value: ITsType) {
        this._variableType = value;
    }

    private _value: ITsExpression<unknown>;
    public get value(): ITsExpression<unknown> {
        return this._value;
    }
    public set value(value: ITsExpression<unknown>) {
        this._value = value;
    }

    private _variableSort: ETsEntitySymbolTypes.Const | ETsEntitySymbolTypes.Let | ETsEntitySymbolTypes.Var;
    public get variableSort(): ETsEntitySymbolTypes.Const | ETsEntitySymbolTypes.Let | ETsEntitySymbolTypes.Var {
        return this._variableSort;
    }

    public set variableSort(value: ETsEntitySymbolTypes.Const | ETsEntitySymbolTypes.Let | ETsEntitySymbolTypes.Var) {
        this._variableSort = value;
    }

    private _isExport: boolean = false;
    public get isExport(): boolean {
        return this._isExport;
    }

    public set isExport(value: boolean) {
        this._isExport = value;
    }

}

export class TsVariableParser extends TsParserBase {
    public static readVariable(reader: ITsParser, isExport?: boolean): TsVariable {
        const parser = new TsVariableParser(reader);
        try {
            console.group('TS Variable reading start');
            return parser.readVariable(isExport);
        } finally {
            console.groupEnd();
        }
    }

    private readVariable(isExport?: boolean): TsVariable {
        const result = new TsVariableImpl();
        result.isExport = isExport;
        this.readEntity(result);
        return result;
    }


    protected analyseEntity(entity: string, entityType: ETsEntitySymbolTypes, variable: TsVariableImpl): ITsEntity {
        const result = super.analyseEntity(entity, entityType, variable);
        if (result) return result;

        // console.log('Variable reading process and analyse entity', entity, entityType);
        switch(entityType) {
            case ETsEntitySymbolTypes.TypeDefinition:
                this.index += entity.length;
                variable.variableType = TsTypeParser.readType(this);
                break;
            case ETsEntitySymbolTypes.Assignment:
                this.index += entity.length;
                const expression = TsExpressionParser.readExpression(this);
                variable.value = expression;
                break;
            case ETsEntitySymbolTypes.EntityName:
                this.index += entity.length;
                variable.name = entity;
                break;
            case ETsEntitySymbolTypes.Const:
            case ETsEntitySymbolTypes.Let:
            case ETsEntitySymbolTypes.Var:
                this.index += entity.length;
                variable.variableSort = entityType;
                break;
            case ETsEntitySymbolTypes.Semicolon:
                return null;
        }
    }

    protected defineEntityType(entity: string): ETsEntitySymbolTypes {
        const result = super.defineEntityType(entity);
        if (result) return result;

        switch(entity) {
            case ':':
                return ETsEntitySymbolTypes.TypeDefinition;
            case '=':
                return ETsEntitySymbolTypes.Assignment;
            case 'const':
                return ETsEntitySymbolTypes.Const;
            case 'let':
                return ETsEntitySymbolTypes.Let;
            case 'var':
                return ETsEntitySymbolTypes.Var;
        }
        if (this.isEntityName(entity)) return ETsEntitySymbolTypes.EntityName;
    }

}