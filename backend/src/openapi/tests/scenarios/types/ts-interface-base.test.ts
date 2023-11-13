import { beforeEach, describe, it } from 'node:test';
import { BaseTest } from '../model';
import { TsInterfaceDefinition } from '~/openapi/ts-parser/ts-types/ts-type-definitions';
import { TsFile } from '~/openapi/reader';
import assert, { strictEqual } from 'assert';
import { TsType } from '~/openapi/ts-parser/ts-types';
import { TsFileParser } from '~/openapi/ts-parser/ts-readers/ts-file-parser';
import { TsGenericServiceType } from '~/openapi/ts-parser/ts-types/ts-type/service-types/ts-generic-service-type';
import { TsTypeService } from '~/openapi/services/ts-type.service';
import { TsAddtitionalInterfaceProperty } from '~/openapi/ts-parser/ts-types/ts-type-definitions/ts-interface-definition/ts-additional-interface-property';
import { TsGenericArgumentItem } from '~/openapi/ts-parser/ts-types/ts-generics-list/ts-generic-argument-item';

class TsInterfaceBaseTest extends BaseTest {
    public static fileToLoad = 'interface-tests/interface.test.ts';
    public static tsFile: TsFile;

    public static _initializer = async () => {
        await this.fileLoad();
        this.tsFile = TsFileParser.readFile(TsInterfaceBaseTest.content.toString(), TsInterfaceBaseTest.fileToLoad);
    };

    public static checkForInterfaceDefinitionParsing() {
        const interfaceDefinition = this.tsFile.types[0];
        assert(interfaceDefinition);
        assert(interfaceDefinition instanceof TsInterfaceDefinition, 'Interface definition is not instance of TsInterfaceDefinition');
        assert(interfaceDefinition.isGeneric, 'Interface definition is not generic');
        strictEqual(interfaceDefinition.genericList.length, 3);
    }

    public static checkForGenericsImplementation() {
        const interfaceDefinition = this.tsFile.types[0];
        const genericList = interfaceDefinition.genericList;
        const [krateType, bgenericType, authenticType] = (genericList as unknown as TsGenericArgumentItem[]);
        strictEqual(krateType.name, 'Krate');
        strictEqual(bgenericType.name, 'BGeneric');
        strictEqual(authenticType.name, 'Authentic');
        assert(krateType.extendsType === undefined);
        assert(bgenericType.extendsType instanceof TsGenericServiceType);
        assert(authenticType.extendsType instanceof TsType);
        assert(bgenericType.extendsType.isGeneric);
        strictEqual(bgenericType.extendsType.genericBase, TsTypeService.PromiseType);
        strictEqual(bgenericType.extendsType.genericList.length, 1);
        strictEqual(bgenericType.extendsType.genericList[0].name, 'Krate');
        strictEqual(authenticType.extendsType.referencedTypeName, 'Object');
    }

    public static checkForInterfaceProperties() {
        const interfaceDefinition = this.tsFile.types[0];
        const interfaceImplementation = interfaceDefinition.definitionType;
        assert(interfaceImplementation);
        assert(interfaceImplementation instanceof TsType);
        assert(!interfaceImplementation.isGeneric);
        assert(!interfaceImplementation.isUnion);
        strictEqual(interfaceImplementation.properties.length, 3);
        const [kProperty, bProperty, aProperty] = interfaceImplementation.properties;
        strictEqual(kProperty.name, 'k');
        strictEqual(bProperty.name, 'b');
        strictEqual(aProperty.name, 'a');
    }

    public static checkForInterfaceWithPropertiesDefinition() {
        const interfaceImplementation = this.tsFile.types[3] as TsInterfaceDefinition;
    }

    public static checkForIntefaceExtendsByOmitWithGenerics() {
        const interfaceDefinition = this.tsFile.types[4] as TsInterfaceDefinition;
        assert(interfaceDefinition);
        console.log('OMIT output:', interfaceDefinition.toOpenApi());
    }

    public static checkInterfaceWithAdditionalProperties() {
        const interfaceDefinition = this.tsFile.types[5] as TsInterfaceDefinition;
        assert(interfaceDefinition);
        const openApi = interfaceDefinition.toOpenApi() as any;
        const interfaceImplementation = openApi[interfaceDefinition.name];
        assert(interfaceImplementation);
        assert(!interfaceImplementation.properties);
        assert(interfaceImplementation.additionalProperties);
        assert(!interfaceImplementation.required);
        const additional = interfaceImplementation.additionalProperties;
        strictEqual(additional.type, 'boolean');
    }

    // TODO
    public static checkInterfaceWithUsingAdditionalProperties() {
        const usingAdditionalInterface = this.tsFile.types[6] as TsInterfaceDefinition;
        assert(usingAdditionalInterface);
        // console.log('Using additional:', JSON.stringify(usingAdditionalInterface.toOpenApi(), null, 2));
    }

    // TODO
    public static checkInterfaceWithPartialModifyer() {
        const partialInterface = this.tsFile.types[5] as TsInterfaceDefinition;
        assert(partialInterface);
        // console.log('Partial extend', partialInterface.extendsList[0].properties);
        // console.log('JSON with partial:', JSON.stringify(partialInterface.toOpenApi(), null, 2));
    }
}

describe('Interface type definition checking', async () => {
    const isInit = TsInterfaceBaseTest._initializer();
    beforeEach(async () => {
        await isInit;
    });

    it.skip('Checking for interface definition parsing', () => {
        TsInterfaceBaseTest.checkForInterfaceDefinitionParsing();
    });

    it.skip('Checking for generics implementation', () => {
        TsInterfaceBaseTest.checkForGenericsImplementation();
    });

    it.skip('Checking for interface properties', () => {
        TsInterfaceBaseTest.checkForInterfaceProperties();
    });

    it.skip('Checking for interface with properties definition', () => {
        TsInterfaceBaseTest.checkForInterfaceWithPropertiesDefinition();
    });

    it.todo
        //.skip
        ('Checking for interface extends by omit with generics', () => {
        TsInterfaceBaseTest.checkForIntefaceExtendsByOmitWithGenerics();
    });

    it.skip('Checking for interface with additional properties', () => {
        TsInterfaceBaseTest.checkInterfaceWithAdditionalProperties();
    });

    it.skip('Checking for interface with using additional properties', () => {
        TsInterfaceBaseTest.checkInterfaceWithUsingAdditionalProperties();
    });

    it.skip
    //.todo
    ('Checking for interface with partial modifyer', () => {
        TsInterfaceBaseTest.checkInterfaceWithPartialModifyer();
    });
});