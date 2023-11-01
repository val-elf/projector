import { isBalanced } from '../utils';
import { TsComment } from '../ts-parser/ts-comment';
import { OATag } from './oa-tag';
import { OASchema } from './oa-schema';
import { OAModule } from './oa-module';
import { OAProperty } from './oa-property';
import { ITsEntity } from '../ts-parser/model';
import { ITsProperty } from '../ts-parser/ts-types';
import { TsBaseTypeDefinition } from '../ts-parser/ts-types/ts-type-definitions/ts-base-type-definition';
import { EDeclarationType } from './model';
import { OARoute } from './oa-route';

type TTagPropertyValueBase = string | string[]
type TTagPropertyValue = TTagPropertyValueBase | { [key: string]: TTagPropertyValue };

export class CommonOADefinition {

    private _properties: { [key: string]: string | object } = {};

    public get properties() {
        return this._properties;
    }

    constructor(public name: EDeclarationType, lines: { value: string, indent: number}[]) {
        let currentProperty: string;
        let propIndent = 0;
        this._properties = lines.reduce((res, line) => {
            const pReader = new OATagParameterReader(line.value);
            let value = pReader.value;
            if (!value) {
                currentProperty = pReader.name;
                propIndent = line.indent;
                value = {};
            } else if (currentProperty && line.indent > propIndent) {
                value = res[currentProperty];
                Object.assign(value, {
                    [pReader.name]: pReader.value
                });
                return res;
            } else if (currentProperty) {
                currentProperty = undefined;
            }
            return {
                ...res,
                [pReader.name]: value,
            }
        }, {});
    }

    public getOAEntity() {
        switch(this.name) {
            case EDeclarationType.Tag:
                return new OATag(this);
            case EDeclarationType.Schema:
                return new OASchema(this);
            case EDeclarationType.Module:
                return new OAModule(this);
            case EDeclarationType.Property:
                return new OAProperty(this);
            case EDeclarationType.Route:
                return new OARoute(this);
        }
    }

    public static getDefinitionFromComments(comments: TsComment[]) {
        const initComment = comments.shift();
        const lines = comments.reduce((res, comment) => {
            return [
                ...res,
                ...comment.lines.map((line, index) => ({ value: line, indent: comment.getLineIndent(index) }))
            ];
        }, [] as { value: string, indent: number }[]);
        return new CommonOADefinition(initComment.OAType, lines);
    }
}

class OATagParameterReader {
    private _name: string;
    private _value: TTagPropertyValue;

    private static readonly ParameterRegex = /^(\s*)(.*?)\s*:\s*(.*)\s*$/;

    public get name() {
        return this._name;
    }

    public get value() {
        return this._value;
    }

    constructor(private parameter) {
        const { name, value } = this.read(this.parameter);
        this._name = name;
        this._value = value;
    }

    public read(input: string): { name: string, value: TTagPropertyValue, indent: number } {
        const parts = input.match(OATagParameterReader.ParameterRegex);
        if (!parts) {
            return { name: input, value: '', indent: 0 };
        };
        const [, indent, name, value] = parts;
        const values = this.parseValue(value);
        return { name, value: values, indent: indent.length };
    }

    private parseValue(value: string): TTagPropertyValue {
        if (/^\[.*\]\s*$/.test(value)) {
            value = value.replace(/^\[(.*)\]$/g, '$1');
            // read by balanced [] and split by ,
            if (value.indexOf(':') > -1) { // not a simple array object
                const items = this.readListOfItems(value);
                const values = items.reduce((res,item) => {
                    const { name, value } = this.read(item);
                    return {
                        ...res,
                        [name]: value,
                    }
                }, {});
                return values;


            } else { // simple list of strings
                if (value.trim() === '') return [];
                const values = value.split(',').map(v => v.trim());
                return values;
            }
        }
        return value.trim();
    }

    private readListOfItems(input: string): string[] {
        const items = [];
        let index = 0;
        while(true) {
            const dpos = input.indexOf(',', index);
            if (dpos === -1) {
                const param = input.substring(index).trim();
                items.push(param)
                break;
            }
            const param = input.substring(index, dpos);
            if (isBalanced(param, ['\\[','\\]'])) {
                items.push(param.trimEnd());
            }
            index = dpos + 1;
        }
        return items;
    }
}