import assert, { strictEqual } from "node:assert";
import { describe, it } from "node:test"
import { TsTypeService } from "~/openapi/services/ts-type.service";
import { TsParserBase } from "~/openapi/ts-parser/ts-readers";
import { TsGenericArgumentItem } from "~/openapi/ts-parser/ts-types/ts-generics-list/ts-generic-argument-item";
import { TsGenericParameterItem } from "~/openapi/ts-parser/ts-types/ts-generics-list/ts-generic-parameter-item";
import { TsInterfaceParser } from "~/openapi/ts-parser/ts-types/ts-type-definitions/ts-interface-definition/parsers/ts-interface-parser";
import { TsTypeParser } from "~/openapi/ts-parser/ts-types/ts-type/parsers/ts-type-parser";

const TYPES_MOCKS = {
    primitives: [
        'string', 'number', 'boolean', 'any', 'void', 'null', 'undefined', 'never', 'unknown',
    ],
    arrays: [
        'string[]', 'number[]', 'boolean[]', 'any[]', 'void[]', 'null[]', 'undefined[]', 'never[]', 'unknown[]',
    ],
    generics: [
        'Promise<string>'
    ],
    genericsList: `interface Aromise<Krate, BGeneric extends Promise<Krate>, Authentic extends Object> {}`,
    genericsWithTheObject: 'Promise<{ deleted: boolean }>',
}

class TsParser extends TsParserBase {}

const getBaseParser = (content: string) => new TsParser(content);

describe('TsTypes tests', () => {
    it('Should read primitive types', () => {
        const types = TYPES_MOCKS.primitives.map(primitive => TsTypeParser.readType(getBaseParser(primitive)));
        assert(types);
        types.forEach((type, index) => {
            strictEqual(type, TsTypeService.PRIMITIVES[index]);
        });
    });

    it('Should read array types', () => {
        const types = TYPES_MOCKS.arrays.map(primitive => TsTypeParser.readType(getBaseParser(primitive)));
        assert(types);
        types.forEach((type, index) => {
            assert(type.isGeneric);
            strictEqual(type.genericBase, TsTypeService.ArrayType);
            const genericItem = type.genericList[0] as TsGenericParameterItem;
            strictEqual(genericItem.itemType, TsTypeService.PRIMITIVES[index]);
        });
    });

    it('Should read generic types', () => {
        const type = TsTypeParser.readType(getBaseParser(TYPES_MOCKS.generics[0]));
        assert(type);
        assert(type.isGeneric);
        strictEqual(type.genericBase, TsTypeService.PromiseType);
        strictEqual(type.genericList.length, 1);
        const genericItem = type.genericList[0] as TsGenericParameterItem;
        strictEqual(genericItem.itemType, TsTypeService.String);
    });

    // TODO
    it('Should read generics list', () => {
        const type = TsInterfaceParser.readInterfaceDefinition(getBaseParser(TYPES_MOCKS.genericsList));
        assert(type);
        assert(type.isGeneric);
        strictEqual(type.genericList.length, 3);
        const { genericList } = type;
        assert(genericList);
        const [krateType, bgenericType, authenticType] = (genericList as unknown as TsGenericArgumentItem[]);
        assert(krateType);
        assert(bgenericType);
        assert(authenticType);
        strictEqual(krateType.name, 'Krate');
        strictEqual(bgenericType.name, 'BGeneric');
        strictEqual(authenticType.name, 'Authentic');

        assert(bgenericType.extendsType);
        assert(authenticType.extendsType);
        assert(bgenericType.extendsType.isGeneric);
        strictEqual(bgenericType.extendsType.genericBase, TsTypeService.PromiseType);
        strictEqual(bgenericType.extendsType.genericList.length, 1);
        strictEqual(bgenericType.extendsType.genericList[0].name, 'Krate');

        strictEqual(authenticType.extendsType.referencedTypeName, 'Object');
    });

    // TODO
    it('Should read generics with the object', () => {
        const type = TsTypeParser.readType(getBaseParser(TYPES_MOCKS.genericsWithTheObject));
        assert(type);
        assert(type.isGeneric);
        strictEqual(type.genericList.length, 1);
        const { genericBase, genericList } = type;
        assert(genericBase);
        assert(genericList);
        strictEqual(genericBase, TsTypeService.PromiseType);

        const [objectType] = (genericList as unknown as TsGenericParameterItem[]);
        assert(objectType);

        assert((objectType).itemType);
        assert(objectType.itemType.properties);
        strictEqual(objectType.itemType.properties.length, 1);

        const [deletedProperty] = objectType.itemType.properties;
        assert(deletedProperty);
        strictEqual(deletedProperty.name, 'deleted');
        assert(deletedProperty.propertyType);
        strictEqual(deletedProperty.propertyType, TsTypeService.Boolean);
    });
});
