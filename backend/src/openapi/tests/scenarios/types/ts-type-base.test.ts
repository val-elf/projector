import { beforeEach, describe, it } from 'node:test';
import assert, { strictEqual } from 'assert';
import { BaseTest } from '../model';
import { TsFile } from '~/openapi/reader';
import { TsTypeDefinition } from '~/openapi/ts-parser/ts-types/ts-type-definitions';
import { ETsEntityTypes } from '~/openapi/ts-parser/ts-readers/model';
import { TsVariable } from '~/openapi/ts-parser/ts-variable/ts-variable';
import { TsTypeParser } from '~/openapi/ts-parser/ts-types/ts-type/parsers/ts-type-parser';
import { TsFileParser } from '~/openapi/ts-parser/ts-readers/ts-file-parser';
import { TsTypeService } from '~/openapi/services/ts-type.service';

export class TypeBaseTest extends BaseTest {
    protected static fileToLoad = 'type-tests/base.test.ts';
    private static tsFile: TsFile;

    public static _initializer = async () => {
        await TypeBaseTest.fileLoad();
        this.tsFile = TsFileParser.readFile(TypeBaseTest.content.toString(), TypeBaseTest.fileToLoad);
    };

    public static testForParsedItemsCount() {
        //load file for parsing
        strictEqual(this.tsFile.items.length, 5, 'Expected 5 items to be parsed');
    }

    public static testForTypeDefinitionParsing() {
        const typeDefinition = this.tsFile.types[0];
        assert(typeDefinition, 'Type definition is not defined');
        assert(typeDefinition instanceof TsTypeDefinition, 'Type definition is not instance of TsTypeDefinition');
        assert(typeDefinition.isGeneric, 'Type definition is not generic');
        strictEqual(typeDefinition.genericList.length, 1, 'Type definition generic list does not contain 1 item');
        strictEqual(typeDefinition.typeName, 'QualifiedInterface');
        strictEqual(typeDefinition.genericList[0].name, 'T');
    }

    public static testForTypeDefinitionContent() {
        const typeDefinition = this.tsFile.types[0] as TsTypeDefinition;
        const typeOfTD = typeDefinition.definitionType;

        strictEqual(typeOfTD.unionTypes && typeOfTD.unionTypes.length, 3);
        assert(typeOfTD.isUnion, 'Type definition is not union');

        const firstUnionType = typeOfTD.unionTypes[0];
        strictEqual(firstUnionType.properties.length, 2, 'First element of union should contain 2 properties');
        strictEqual(firstUnionType.methods.length, 1, 'First element of union should contain 1 method');
    }

    public static testForVariable() {
        const variableItem: TsVariable = this.tsFile.items[1] as TsVariable;
        strictEqual(variableItem.entityType, ETsEntityTypes.Variable, 'Expected variable entity type');
        strictEqual(variableItem.name, 'b', 'Expected variable name is \'b\'');
        assert(variableItem.isExport, 'Expected variable shold be exported');
    }

    public static testForUnionStringTypesInGeneric() {
        const typeItem: TsTypeDefinition = this.tsFile.items[2] as TsTypeDefinition;
        assert(typeItem);
        strictEqual(typeItem.name, 'TInitialEntity');
        assert(typeItem.isGeneric);
        strictEqual(typeItem.genericList.length, 1);
        strictEqual(typeItem.genericList[0].name, 'T');

        const typeDeclaration = typeItem.definitionType;
        assert(typeDeclaration);
        assert(typeDeclaration.isGeneric);
        strictEqual(typeDeclaration.genericList.length, 2, 'Expected 2 generic types in type declaration');
        strictEqual(typeDeclaration.genericBase, TsTypeService.OmitType);
        strictEqual(typeDeclaration.genericList[0].itemType.referencedTypeName, 'T');
        const unionType = typeDeclaration.genericList[1].itemType;
        assert(unionType);
        assert(unionType.isUnion);
        strictEqual(unionType.unionTypes.length, 3, 'Expected 3 union types in union type');
        // strictEqual()
    }

    public static testForUnionTypeWithMixedDefinitions() {
        const typeItem: TsTypeDefinition = this.tsFile.items[4] as TsTypeDefinition;
        assert(typeItem);
        const [unionOne, unionTwo] = typeItem.definitionType.unionTypes;
        assert(unionOne);
        assert(unionTwo);
    }

}

describe('Base type definition checking', () => {
    const isInit = TypeBaseTest._initializer();

    beforeEach(async () => {
        await isInit;
    });

    it('Checking for type definition parsing', () => {
        TypeBaseTest.testForTypeDefinitionParsing();
    });

    it('Checking for type definition content', () => {
        TypeBaseTest.testForTypeDefinitionContent();
    });

    it('Checking items count parsed for script file', () => {
        TypeBaseTest.testForParsedItemsCount();
    });

    it('Checking for variable definition', () => {
        TypeBaseTest.testForVariable();
    });

    it('Checking for parsing union types in generic', () => {
        TypeBaseTest.testForUnionStringTypesInGeneric();
    });

    it('Checking for parsing union types with mixed definitions', () => {
        TypeBaseTest.testForUnionTypeWithMixedDefinitions();
    });

});