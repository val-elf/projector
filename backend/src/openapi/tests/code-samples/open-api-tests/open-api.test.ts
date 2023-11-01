// @OA:module
// version: [openapi: 3.0.0]
// info: [title: Projector Backend, version: 1.0.0]
// responses:
//      200: OK
//      401: [description: Bad request, type: IError]
//      403: [description: Forbidden, type: IError]
//      404: [description: Not found, type: IError]
//      500: [description: Internal server error, type: IError]
// security:
//      APIKeyHeader: [type: apiKey, in: header, name: Authorization]

// @OA:schema
// description: Element item
export interface IElement {
    id: IElementId;
    name: string;
    date: Date;
}

// @OA:schema
// description: Element id
export type IElementId = string;

enum EMethod {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    DELETE = 'delete',
    PATCH = 'patch',
    OPTIONS = 'options',
    HEAD = 'head',
    CONNECT = 'connect',
    TRACE = 'trace',
}

// @OA:tag
// name: Elements
// description: Elements API
// summary: Set of the API for elements
@Router({ baseUrl: '/api/v1/' })
export class ElementsApi {
    // @OA:route
    // description: Get all elements
    @Route(EMethod.GET, 'elements')
    public async getElements(): Promise<IElement[]> {
        return [];
    }
}

