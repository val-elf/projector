import { OATag, OASchema, OAModule, CommonOADefinition, OpenApi } from '../components';
import { TsParser } from '../ts-parser/ts-readers/ts-parser';
import { TsComment } from '../ts-parser/ts-comment';
import { TsClass } from '../ts-parser/ts-type/ts-type-definitions/ts-class-definition/ts-class-definition';
import { TsBaseTypeDefinition } from '../ts-parser/ts-type/ts-type-definitions/ts-base-type-definition';

export enum EDeclarationType {
    Module = 'module',
    Schema = 'schema',
    Property = 'property',
    Route = 'route',
    Tag = 'tag',
}

export function analyseFile(result: OpenApi, content: string, fileName: string): any {
    console.log(`\n--------------------------------- ANALYSE FILE '${fileName}' ---------------------------------`);

    const parser = new TsParser(content);
    let latestTag: OATag | undefined;

    while(true) {
        let entity = parser.readEntity();
        if (!entity) break;
        if (entity instanceof TsComment && entity.isOA) {
            const commentTag = CommonOADefinition.readFromReader(entity, parser);
            switch(entity.OAType) {
                case EDeclarationType.Module:
                    result.setModule(new OAModule(commentTag));
                    break;
                case EDeclarationType.Schema:{
                    const schemaEntity = parser.readEntity();
                    applySchemaItem(result, new OASchema(commentTag, result, schemaEntity as TsBaseTypeDefinition));
                    break;
                }
                case EDeclarationType.Tag:
                    latestTag = new OATag(commentTag);
                    applySchemaItem(result, latestTag);
                    break;
                case EDeclarationType.Route:
                    break;
            }
        }
        if (entity instanceof TsClass || entity instanceof TsBaseTypeDefinition) {
            if (entity instanceof TsClass) {
                entity.tag = latestTag;
            }
            applySchemaItem(result, entity);
        }
    }
}

/*
function readFullDefinition(type: string, content: string, index: number): {
    data: any,
    type: string,
} {
    const result = {
        data: null,
        type,
    };
    const lines = content.substring(index).split(/[\r\n]/).filter(i => i);
    const lineEnd = /^\s*\/\//;
    const indexer = {
        lineIndex: 1
    };

    let currentUsedTag

    while (lineEnd.test(lines[indexer.lineIndex])) {
        indexer.lineIndex ++;
    }

    const declarations = lines.slice(1, indexer.lineIndex)
        .map(line => line.replace(/\s*\/\/\s* /, '')); <---------------------------- FIX THIS

    const data = parseDeclarations(type, declarations);
    const [definition, body] =
        type === EDeclarationType.Schema ? [selectSchemaDefinition(lines, indexer), selectSchemaBodyDefinition(lines, indexer)]
        : type === EDeclarationType.Alias ? [lines[indexer.lineIndex], '']
        : type === EDeclarationType.Tag ? [lines[indexer.lineIndex], '']
        : type === EDeclarationType.Route ? [selectRouteDefinition(lines, indexer), selectRouteBodyDefinition(lines, indexer)]
        : ['','']
    ;

    switch (type) {
        case EDeclarationType.Alias:
            Object.assign(data, parseAliasDefinition(definition, data));
            break;
        case EDeclarationType.Schema:
            Object.assign(data, parseSchemaDefinition(definition, data, body));
            break;
        case EDeclarationType.Tag:
            Object.assign(data, parseTagDefinition(definition, data, body));
            break;
        case EDeclarationType.Route:
            Object.assign(data, parseRouteDefinition(definition, data, body));
            break;
    }
    result.data = data;
    return result;
}
*/

function applySchemaItem(result: OpenApi, item: OASchema | OATag | TsClass | TsBaseTypeDefinition) {
    if (item instanceof OASchema) {
        result.components.schemas[item.name] = item;
    } else if (item instanceof OATag) {
        result.tags.push(item);
    } else if (item instanceof TsClass) {
        result.classes.push(item);
    } else if (item instanceof TsBaseTypeDefinition) {
        result.types.push(item);
    }
}