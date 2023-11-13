import { beforeEach, describe, it } from "node:test";
import { BaseTest } from "../model";
import { TsFile } from "~/openapi/reader";
import assert, { strictEqual } from "assert";
import { TsInterfaceDefinition } from "~/openapi/ts-parser/ts-types/ts-type-definitions";
import { TsFileParser } from "~/openapi/ts-parser/ts-readers/ts-file-parser";


class TestOADefinitionsForInterfaces extends BaseTest {
    static fileToLoad = 'interface-tests/oa-properties.test.ts';
    static tsFile: TsFile;

    public static _initializer = async () => {
        await this.fileLoad();
        this.tsFile = TsFileParser.readFile(this.content.toString(), this.fileToLoad);
    };

    public static checkForInterfaceSchemaDefinition() {
        const interfaceDefinition = this.tsFile.types[1];
        assert(interfaceDefinition, 'Interface should de initialized');
        assert(interfaceDefinition instanceof TsInterfaceDefinition, 'Interface should be instance of TsInterfaceDefinition');
        const { schema } = interfaceDefinition;
        assert(schema, 'Schema should be initialized');
        strictEqual(schema.name, 'Artifact');
    }

    public static checkForInterfacePropertiesDefinition() {
        const interfaceDefinition = this.tsFile.types[1];
        const { properties, methods } = interfaceDefinition;
        strictEqual(properties.length, 3);
        strictEqual(methods.length, 1);
        const [idProperty, faithProperty, nameProperty] = properties;
        strictEqual(idProperty.name, 'id');
        strictEqual(faithProperty.name, 'faith');
        strictEqual(nameProperty.name, 'name');
        assert(idProperty.definition, 'Property Definition for id property should be initialized');
        assert(nameProperty.definition, 'Property Definition for name property should be initialized');
        assert(!faithProperty.definition, 'Property Definition for faith property should not be initialized');
        strictEqual(idProperty.definition.description, `Artifact's ID`);
    }
}


describe('Interface OA-Tags implementation checking', async () => {
    const isInit = TestOADefinitionsForInterfaces._initializer();
    beforeEach(async () => {
        await isInit;
    });

    it('Checking for interface schema definition', () => {
        TestOADefinitionsForInterfaces.checkForInterfaceSchemaDefinition();
    });

    it('Checking for interface properties definition', () => {
        TestOADefinitionsForInterfaces.checkForInterfacePropertiesDefinition();
    });
});