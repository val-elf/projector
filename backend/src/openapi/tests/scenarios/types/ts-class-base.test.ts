import { beforeEach, describe, it } from "node:test";
import { BaseTest } from "../model";
import assert, { strictEqual } from "assert";
import { TsTypeParser } from "~/openapi/ts-parser/ts-types/ts-type/parsers/ts-type-parser";
import { TsFileParser } from "~/openapi/ts-parser/ts-readers/ts-file-parser";
import { TsFile } from "~/openapi/reader";
import { TsTypeService } from "~/openapi/services/ts-type.service";

class TsClassesTest extends BaseTest {
    static fileToLoad = 'class-tests/base.test.ts';
    static tsFile: TsFile;

    public static _initializer = async () => {
        await this.fileLoad();
        this.tsFile = TsFileParser.readFile(this.content.toString(), this.fileToLoad);
    };

    public static checkForClassDefinition() {
        const [classDefinition] = this.tsFile.classes;
        assert(classDefinition);
        strictEqual(classDefinition.name, 'ArtifactRouter');
        strictEqual(classDefinition.isExport, true);
        const [classDecorator] = classDefinition.decorators
        assert(classDecorator);
        strictEqual(classDecorator.name, 'Router');
        strictEqual(classDecorator.argumentsList.count, 0);
    }

    public static checkForClassMethodsImplementation() {
        console.log(this.tsFile.classes);
        const [classDefinition] = this.tsFile.classes;
        assert(classDefinition);
        const [deleteMethod, helloMethod] = classDefinition.methods;
        strictEqual(deleteMethod.name, 'deleteArtifact');
        strictEqual(deleteMethod.isAbstract, false);
        strictEqual(deleteMethod.isStatic, false);
        strictEqual(deleteMethod.isAsync, true);
        strictEqual(deleteMethod.accessModifier, 'public');
        strictEqual(deleteMethod.returnType.genericBase, TsTypeService.PromiseType);
        strictEqual(deleteMethod.returnType.genericList.length, 1);

        const [decorator] = deleteMethod.decorators;
        assert(decorator);
        strictEqual(decorator.name, 'Route');

        const definition = deleteMethod.definition;
        assert(definition);

    }
}

describe('TsClass tests', () => {
    const isInit = TsClassesTest._initializer();
    beforeEach(async () => {
        await isInit;
    });

    it('Should read class definition', () => {
        TsClassesTest.checkForClassDefinition();
    });

    it('Check for class methods implementation', () => {
        TsClassesTest.checkForClassMethodsImplementation();
    });
});