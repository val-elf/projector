import swaggerJsdoc from "swagger-jsdoc";
import { prepareJSDoc } from './openapi/openapi';
import { IOpenApi } from './openapi/components/model';
import { test } from './openapi/tests/scenarios';

const options = {
    failOnErrors: true, // Whether or not to throw when parsing errors. Defaults to false.
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Projector Backend",
            version: "1.0.0",
        },
        components: {
            securitySchemes: {
                APIKeyHeader: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'Authorization',
                },
            },
            security: {
                APIKeyHeader: [],
            },
        },
    },
    apis: [
        // './src/openapi/tests/code-samples/initial.ts', // tests
        // './src/openapi/tests/code-samples/models.actual.ts', // tests
        // './src/openapi/tests/code-samples/dbbase.actual.ts', // tests
        // './src/openapi/tests/code-samples/entity.model.ts', // tests
        // './src/openapi/tests/code-samples/navigation.actual.ts', // tests
        // './src/openapi/tests/code-samples/routers.actual.ts', // tests
        //'./src/openapi/tests/code-samples/artifacts.actual.ts', // tests
        // './src/openapi/tests/code-samples/temporary.ts', // tests
        // './src/openapi/tests/code-samples/core.model.ts', // tests



        './src/backend/core/models.ts', // models
        './src/backend/entities/models/**.ts', // models
        './src/server/**.ts', // paths
    ],
};

export async function runSwaggerTests() {
    test();
}


export async function getOpenApiSpecification() {
    let openapiSpecification = { components: { schemas: {} }, tags: [], paths: {} };
    openapiSpecification = swaggerJsdoc(options) as any;
    const additionals = await prepareJSDoc(options);
    // return mergeWithOld(openapiSpecification, additionals);
    return additionals;
}

/*
function mergeWithOld(openapiSpecification: any, additionals: any, ) {
    let schemas = openapiSpecification.components.schemas ?? {};
    let paths = openapiSpecification.paths ?? {};
    let { tags } = additionals;

    Object.assign(schemas, additionals.components.schemas);
    Object.assign(paths, { ...additionals.paths });

    openapiSpecification.components.schemas = schemas;
    openapiSpecification.tags.push(...tags);
    return openapiSpecification;
}
*/