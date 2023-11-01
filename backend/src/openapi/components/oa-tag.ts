import { ETsEntityTypes } from '../ts-parser/ts-readers/model';
import { CommonOADefinition } from './common-oa-definition';
import { EDeclarationType, IOATag, OADefinition } from './model';

export class OATag extends OADefinition implements IOATag {
    public readonly name: string;
    public readonly description: string;
    public readonly summary?: string;
    public readonly externalDocs?: any;
    public readonly type: EDeclarationType = EDeclarationType.Tag;
    public readonly entityType: ETsEntityTypes = ETsEntityTypes.OADefinition;

    constructor(
        data: CommonOADefinition,
    ) {
        super(data);
        this.name = data.properties.name as string;
        this.description = data.properties.description as string;
        this.summary = data.properties.summary as string;
        this.externalDocs = data.properties.externalDocs;
    }

    public toOpenApi(): any {
        return {
            name: this.name,
            description: this.description,
            summary: this.summary,
            externalDocs: this.externalDocs
        };
    }
}