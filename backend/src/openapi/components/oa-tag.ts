import { CommonOADefinition } from './common-oa-definition';
import { ITag } from './model';

export class OATag implements ITag{
    public readonly name: string;
    public readonly description: string;
    public readonly summary?: string;
    public readonly externalDocs?: any;

    constructor(
        data: CommonOADefinition,
    ) {
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