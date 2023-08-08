import { OATag, CommonOADefinition } from '../../../../components';
import { IOpenApiGather, IOpenApiSerializable, IPathsDefinition } from '../../../../components/model';
import { ITsTagged } from '../../../model';
import { TsComment } from '../../../ts-comment';
import { TsDecorator } from '../../../ts-decorator';
import { TsMethod } from './ts-method';
import { ETsEntityTypes, ITsReader, TsEntity } from '../../../ts-readers/model';
import { TsClassParser } from './ts-class-parser';
import { TsClassProperty } from './ts-class-property';
import { mergeDeep } from '~/openapi/utils';

export class TsClass extends TsEntity implements IOpenApiSerializable, ITsTagged {
    public readonly methods: TsMethod[];
    public readonly properties: TsClassProperty[];
    private reader: ITsReader;

    public readonly type = ETsEntityTypes.Class;

    private _tag: OATag;

    public get tag(): OATag {
        return this._tag;
    }

    public set tag(value: OATag) {
        this._tag = value;
    }

    constructor(
        reader: ITsReader,
        public readonly isExport: boolean,
        public readonly isAbstract: boolean,
        public readonly decorators: TsDecorator[],
    ) {
        super('', ETsEntityTypes.Class);
        this.methods = [];
        this.properties = [];
        this.read(reader);
    }

    toOpenApi(gatherer: IOpenApiGather): IPathsDefinition {
        try {
            gatherer.currentContext = this;
            return this.methods.reduce((res, m) => mergeDeep(res, m.toOpenApi(gatherer)), {});
        } finally {
            gatherer.releaseContext();
        }
    }

    private read(reader: ITsReader): void {
        const classDef = reader.expectOf('{', true);
        const body = reader.readToBalanced('}', true);
        // console.log(`\n---------------------- READ CLASS (${classDef})----------------------`);
        if (classDef && body) {
            this.reader = new TsClassParser(body, reader);
            this.parseClassDef(classDef);
            this.parseBody();
        }
    }

    private parseClassDef(definition: string) {
    }

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
