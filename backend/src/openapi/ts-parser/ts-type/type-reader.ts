import util from "util";

import { CommonOADefinition } from '~/openapi/components';
import { ETsTypeKind } from './model';
import { ITsProperty } from './ts-property';
import { TsInterfaceParser } from './ts-type-definitions/ts-interface-definition/ts-interface-parser';
import { TsTypeBase } from './type-base';
import { ETsEntityTypes, TsEntity } from '../ts-readers/model';
import { TsComment } from '../ts-comment';
import { getBalancedEnd, isBalanced } from '~/openapi/utils';

export class TypeReader {
    private index = 0;

    private get def() {
        return this.definition.substring(this.index);
    }

    constructor(private definition: string) {
        if (definition === undefined) throw new Error('Definition cannot be undefined');
    }

    public readTypeEntity(): ETsTypeKind | TsTypeBase | ITsProperty[] | null{
        const nonSpaceMatch = this.def.match(/\S/);
        let sign = nonSpaceMatch ? nonSpaceMatch[0] : null;
        this.index += sign ? nonSpaceMatch.index : this.def.length;
        switch (sign) {
            case '|':
                this.index ++;
                return ETsTypeKind.Union;
            case '&':
                this.index ++;
                return ETsTypeKind.Intersection;
            case '<':
                return ETsTypeKind.Generic;
            case '{':
                return this.readInterface();
            case '[':
                this.index ++;
                if (this.def.startsWith(']')) {
                    this.index ++;
                    return ETsTypeKind.Array;
                }
            default:
                return this.readTypeName();
        }
    }

    public readGenericParameters(): TsTypeBase[] {
        const bpos = getBalancedEnd(this.def, ['<', '>']);
        const paramsString = this.def.substring(1, bpos);
        let index = 0;
        const items = [];
        while(true) {
            const cpos = paramsString.indexOf(',', index);
            if (cpos === -1) {
                items.push(new TsTypeBase(paramsString.substring(index)));
                break;
            }
            const part = paramsString.substring(index, cpos);
            const qbalanced = isBalanced(part, ['{', '}']);
            const cbalanced = isBalanced(part, ['<', '>']);
            if (qbalanced && cbalanced) {
                items.push(new TsTypeBase(paramsString.substring(index, cpos), true));
            }
            index = cpos + 1;
        }

        this.index += bpos + 1;
        return items;
    }

    private readInterface(): TsTypeBase | ITsProperty[] {
        const closeIndex = getBalancedEnd(this.def, ['{', '}']);
        if (closeIndex === -1) return null;
        if (closeIndex + 1 === this.def.trimEnd().length) {
            // this body is and whole interface definition
            return this.parseInterface();
        } else {
            const fullInterface = this.def.substring(0, closeIndex + 1);
            this.index += closeIndex + 1;
            return new TsTypeBase(fullInterface);
        }
    }

    private parseInterface() {
        const reader = new TsInterfaceParser(this.def);
        let propertyDefinition: CommonOADefinition;
        const properties: ITsProperty[] = [];
        while(true) {
            const entity = reader.readEntity();
            if (!entity) break;
            if (!(entity instanceof TsEntity)) continue;
            if (entity instanceof TsComment) {
                if (entity.isOA && entity.OAType === 'property') {
                    propertyDefinition = CommonOADefinition.readFromReader(entity, reader);
                    continue;
                }
            }
            switch (entity.entityType) {
                case ETsEntityTypes.Property:
                    {
                        const property = entity as unknown as ITsProperty;
                        property.definition = propertyDefinition;
                        properties.push(property);
                        break;
                    }
                default:
                    propertyDefinition = undefined;
                    break;
            }
        }
        return properties;
    }

    private readTypeName(): TsTypeBase {
        const typeNameMatch = this.def.match(/^(\w[\w]+)/);
        if (!typeNameMatch) {
            return null;
        }

        this.index += typeNameMatch[1].length;
        return new TsTypeBase(typeNameMatch[1], true);
    }

    [util.inspect.custom]() {
        return { reader: this.def, index: this.index };
    }

}

