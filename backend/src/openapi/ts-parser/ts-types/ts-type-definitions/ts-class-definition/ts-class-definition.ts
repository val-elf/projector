import { OATag, CommonOADefinition } from '../../../../components';
import { IOpenApiGather, IOpenApiSerializable, IPathsDefinition } from '../../../../components/model';
import { ITsTagged, TsEntity } from '../../../model';
import { TsComment } from '../../../ts-comment';
import { TsDecorator } from '../../../ts-decorator';
import { TsMethod } from './ts-method';
import { ETsEntityTypes, ITsParser } from '../../../ts-readers/model';
import { TsClassParser } from './ts-class-parser';
import { TsClassProperty } from './ts-class-property';
import { mergeDeep } from '~/openapi/utils';

/**
 * TsClass
 * reading the class definition and implementation for further extracting routes to OpenApi specification
 */
export class TsClass extends TsEntity implements IOpenApiSerializable, ITsTagged {

    // methods and properties of the class
    public readonly methods: TsMethod[];
    public readonly properties: TsClassProperty[];
    private reader: ITsParser;

    // type of the entity
    public readonly type = ETsEntityTypes.Class;

    private _tag: OATag;

    // current OpenApi tag
    public get tag(): OATag {
        return this._tag;
    }

    public set tag(value: OATag) {
        this._tag = value;
    }

    /**
     * TsClass constructor
     * @param reader - reader to read class definition
     * @param isExport - is class exported
     * @param isAbstract - is class abstract
     * @param decorators - class decorators
     */
    constructor(
        reader: ITsParser,
        public readonly isExport: boolean,
        public readonly isAbstract: boolean,
        public readonly decorators: TsDecorator[],
    ) {
        super('', ETsEntityTypes.Class);
        this.methods = [];
        this.properties = [];
        this.read(reader);
    }

    /**
     * Export class definition to OpenApi specification
     * @param gatherer - gatherer to collect all definitions
     * @returns - OpenApi paths definition
     */
    toOpenApi(gatherer: IOpenApiGather): IPathsDefinition {
        try {
            gatherer.currentContext = this;
            return this.methods.reduce((res, m) => mergeDeep(res, m.toOpenApi(gatherer)), {});
        } finally {
            gatherer.releaseContext();
        }
    }

    // read full class definition
    private read(reader: ITsParser): void {
        const classDef = reader.expectOf('{', true);
        const body = reader.readToBalanced('}', true);
        // console.log(`\n---------------------- READ CLASS (${classDef})----------------------`);
        if (classDef && body) {
            this.reader = new TsClassParser(body, reader);
            this.parseClassDefinition(classDef);
            this.parseBody();
        }
    }

    // parging class defintion
    private parseClassDefinition(definition: string) {
        // TODO: should be implemented by reading class header (arguments, extends and interfaces implements)
    }

    // parsing class body
    private parseBody() {
        // console.log('----------------------------- START PARSE BODY ---------------------------');
        let routeDefinition: CommonOADefinition | undefined;
        while (true) {
            const entity = this.reader.readEntity();
            if (!entity) break;
            if (!(entity instanceof TsEntity)) continue;

            if (entity instanceof TsComment) {
                if (entity.isOA && entity.OAType === 'route') {
                    routeDefinition = CommonOADefinition.readFromReader(entity, this.reader);
                    continue;
                }
            }
            switch (entity.entityType) {
                case ETsEntityTypes.Method:
                    {
                        const method = entity as TsMethod;
                        method.methodDefinition = routeDefinition;
                        this.methods.push(method);
                        break;
                    }
                case ETsEntityTypes.Property:
                    this.properties.push(entity as TsClassProperty);
                    break;
            }
        }
        // console.log('-------------- END PARSE BODY -----------------');
    }
}
