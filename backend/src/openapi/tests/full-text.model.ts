export const schema = {
    openapi: "3.0.0",
    info: { title: "Projector Backend", version: "1.0.0" },
    components: {
        securitySchemes: {
            APIKeyHeader: {
                type: "apiKey",
                in: "header",
                name: "Authorization",
            },
        },
        security: { APIKeyHeader: [] },
        schemas: {
            TShape: {
                description: "Array of the 2D coordinates",
                type: "array",
                items: {
                    type: "object",
                    $ref: "#/components/schemas/ICoord2D",
                },
            },
            ICommonEntity: {
                type: "object",
                description: "Common entity interface",
                properties: {
                    _id: { description: "Entity identity", type: "string" },
                },
            },
            IBaseUser: {
                type: "object",
                description: "Base User interface",
                properties: {},
            },
            IUser: {
                type: "object",
                description: "User interface",
                properties: {
                    _id: { description: "Entity identity", type: "string" },
                    _coretype: { description: "Core type", type: "string" },
                    _hash: { description: "Object hash", type: "string" },
                },
            },
            IServerUser: {
                type: "object",
                description: "User interface for server side",
                properties: {
                    _id: { description: "Entity identity", type: "string" },
                    _coretype: { description: "Core type", type: "string" },
                    _hash: { description: "Object hash", type: "string" },
                },
            },
            IBaseTimespot: {
                type: "object",
                description: "Base timespot interface",
                properties: {
                    startDate: {
                        description: "Timespot start date",
                        type: "string",
                    },
                    startOffsetX: {
                        description: "Timespot start offset",
                        type: "number",
                    },
                    endDate: {
                        description: "Timespot end date",
                        type: "string",
                    },
                    endOffsetX: {
                        description: "Timespot end offset",
                        type: "number",
                    },
                    offsetX: { description: "Timespot offset", type: "number" },
                    title: { description: "Timespot title", type: "string" },
                    description: {
                        description: "Timespot description",
                        type: "string",
                    },
                    locked: { description: "Timespot locked", type: "boolean" },
                },
                required: ["startDate", "title"],
            },
            IBaseTimeline: {
                type: "object",
                description: "Base timeline interface",
                properties: {
                    name: { description: "Timeline name", type: "string" },
                    description: {
                        description: "Timeline description",
                        type: "string",
                    },
                    startDate: {
                        description: "Timeline start date",
                        type: "string",
                    },
                    endDate: {
                        description: "Timeline end date",
                        type: "string",
                    },
                    locked: { description: "Timeline locked", type: "boolean" },
                },
                required: ["name", "startDate", "endDate"],
            },
            ITag: {
                type: "object",
                description: "Tag",
                properties: {
                    _id: { description: "Entity identity", type: "string" },
                    _coretype: { description: "Core type", type: "string" },
                    _hash: { description: "Object hash", type: "string" },
                    name: { description: "Tag name", type: "string" },
                },
                required: ["_coretype", "_hash", "name"],
            },
            IBaseProject: {
                type: "object",
                description: "Project entity base schema",
                properties: {
                    name: { description: "Project name", type: "string" },
                    description: {
                        description: "Project description",
                        type: "string",
                    },
                },
                required: ["name"],
            },
            IProject: {
                type: "object",
                description: "Project entity database schema",
                properties: {
                    name: { description: "Project name", type: "string" },
                    description: {
                        description: "Project description",
                        type: "string",
                    },
                    _id: { description: "Entity identity", type: "string" },
                    _coretype: { description: "Core type", type: "string" },
                    _hash: { description: "Object hash", type: "string" },
                    preview: {
                        description: "Preview image",
                        type: "object",
                        $ref: "#/components/schemas/IPreview",
                    },
                },
                required: ["name"],
            },
            IInitProject: {
                type: "object",
                description:
                    "Update project entity client schema (create or update)",
                properties: {
                    name: { description: "Project name", type: "string" },
                    description: {
                        description: "Project description",
                        type: "string",
                    },
                    _id: { description: "Entity identity", type: "string" },
                },
                required: ["name"],
            },
            ICoord2D: {
                type: "object",
                description: "2D coordinate",
                properties: {
                    x: { description: "X coordinate", type: "number" },
                    y: { description: "Y coordinate", type: "number" },
                },
                required: ["x", "y"],
            },
            IImage: {
                type: "object",
                description: "Location image",
                properties: {
                    x: { description: "X coordinate", type: "number" },
                    y: { description: "Y coordinate", type: "number" },
                    _file: { description: "Image file id", type: "string" },
                    width: { description: "Image width (px)", type: "number" },
                    height: {
                        description: "Image height (px)",
                        type: "number",
                    },
                    zoom: { description: "Image zoom", type: "number" },
                },
                required: ["x", "y", "_file", "width", "height", "zoom"],
            },
            IBaseLocation: {
                type: "object",
                description: "Base Location interface",
                properties: {
                    name: { description: "Location name", type: "string" },
                    locationType: {
                        description: "Location type",
                        type: "enum",
                        enum: [
                            "building",
                            "street",
                            "city",
                            "country",
                            "state",
                            "mainland",
                            "continent",
                            "planet",
                            "galaxy",
                            "universe",
                            "multiverse",
                            "georegion",
                        ],
                    },
                    description: {
                        description: "Location description",
                        type: "string",
                    },
                    position: {
                        description: "Location position",
                        type: "object",
                        $ref: "#/components/schemas/ICoord2D",
                    },
                    map: {
                        description: "Location map",
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                shape: {
                                    type: "object",
                                    $ref: "#/components/schemas/TShape",
                                },
                                image: {
                                    type: "object",
                                    $ref: "#/components/schemas/IImage",
                                },
                            },
                        },
                    },
                    _mapFile: {
                        description: "Location map file id",
                        type: "string",
                    },
                    scale: {
                        description: "Location scale factor",
                        type: "number",
                    },
                    parent: {
                        description: "Location parent information structur",
                        type: "object",
                        properties: {
                            position: {
                                type: "object",
                                $ref: "#/components/schemas/ICoord2D",
                            },
                            scale: { type: "number" },
                            _location: { type: "string" },
                        },
                    },
                },
                required: [
                    "name",
                    "locationType",
                    "description",
                    "position",
                    "map",
                ],
            },
            ILocation: {
                type: "object",
                description: "Main output Location interface",
                properties: {
                    name: { description: "Location name", type: "string" },
                    locationType: {
                        description: "Location type",
                        type: "enum",
                        enum: [
                            "building",
                            "street",
                            "city",
                            "country",
                            "state",
                            "mainland",
                            "continent",
                            "planet",
                            "galaxy",
                            "universe",
                            "multiverse",
                            "georegion",
                        ],
                    },
                    description: {
                        description: "Location description",
                        type: "string",
                    },
                    position: {
                        description: "Location position",
                        type: "object",
                        $ref: "#/components/schemas/ICoord2D",
                    },
                    map: {
                        description: "Location map",
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                shape: {
                                    type: "object",
                                    $ref: "#/components/schemas/TShape",
                                },
                                image: {
                                    type: "object",
                                    $ref: "#/components/schemas/IImage",
                                },
                            },
                        },
                    },
                    _mapFile: {
                        description: "Location map file id",
                        type: "string",
                    },
                    scale: {
                        description: "Location scale factor",
                        type: "number",
                    },
                    parent: {
                        description: "Location parent information structur",
                        type: "object",
                        properties: {
                            position: {
                                type: "object",
                                $ref: "#/components/schemas/ICoord2D",
                            },
                            scale: { type: "number" },
                            _location: { type: "string" },
                        },
                    },
                    _id: { description: "Entity identity", type: "string" },
                    _coretype: { description: "Core type", type: "string" },
                    _hash: { description: "Object hash", type: "string" },
                    preview: {
                        description: "Preview image",
                        type: "object",
                        $ref: "#/components/schemas/IPreview",
                    },
                },
                required: [
                    "name",
                    "locationType",
                    "description",
                    "position",
                    "map",
                ],
            },
            IInitLocation: {
                type: "object",
                description:
                    "Initial and update Location interface (sends from client side)",
                properties: {
                    name: { description: "Location name", type: "string" },
                    locationType: {
                        description: "Location type",
                        type: "enum",
                        enum: [
                            "building",
                            "street",
                            "city",
                            "country",
                            "state",
                            "mainland",
                            "continent",
                            "planet",
                            "galaxy",
                            "universe",
                            "multiverse",
                            "georegion",
                        ],
                    },
                    description: {
                        description: "Location description",
                        type: "string",
                    },
                    position: {
                        description: "Location position",
                        type: "object",
                        $ref: "#/components/schemas/ICoord2D",
                    },
                    map: {
                        description: "Location map",
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                shape: {
                                    type: "object",
                                    $ref: "#/components/schemas/TShape",
                                },
                                image: {
                                    type: "object",
                                    $ref: "#/components/schemas/IImage",
                                },
                            },
                        },
                    },
                    _mapFile: {
                        description: "Location map file id",
                        type: "string",
                    },
                    scale: {
                        description: "Location scale factor",
                        type: "number",
                    },
                    parent: {
                        description: "Location parent information structur",
                        type: "object",
                        properties: {
                            position: {
                                type: "object",
                                $ref: "#/components/schemas/ICoord2D",
                            },
                            scale: { type: "number" },
                            _location: { type: "string" },
                        },
                    },
                    _id: { description: "Entity identity", type: "string" },
                },
                required: [
                    "name",
                    "locationType",
                    "description",
                    "position",
                    "map",
                ],
            },
            IBaseFile: {
                type: "object",
                description: "Base File interface",
                properties: {
                    name: { description: "File name", type: "string" },
                    file: { description: "File path", type: "string" },
                    type: { description: "File type", type: "string" },
                    size: { description: "File size", type: "number" },
                    transcoder: {
                        description: "Transcoder id to use",
                        type: "string",
                    },
                    _transcode: {
                        description: "Transcode process id",
                        type: "string",
                    },
                    exif: {
                        description: "Exif data",
                        type: "object",
                        additionalProperties: {
                            "[key: string]": {
                                type: "object",
                                oneOf: [
                                    { type: "string" },
                                    { type: "number" },
                                    { type: "boolean" },
                                ],
                            },
                        },
                    },
                    /*_status: {
                        description: "File status",
                        type: "object",
                        properties: {
                            status: {
                                type: "object",
                                $ref: "#/components/schemas/string, exif?: string, preview?: string",
                            },
                        },
                    },*/
                },
                required: ["name", "file", "type", "size"],
            },
            IFile: {
                type: "object",
                description: "Main output File interface",
                properties: {
                    name: { description: "File name", type: "string" },
                    file: { description: "File path", type: "string" },
                    type: { description: "File type", type: "string" },
                    size: { description: "File size", type: "number" },
                    transcoder: {
                        description: "Transcoder id to use",
                        type: "string",
                    },
                    _transcode: {
                        description: "Transcode process id",
                        type: "string",
                    },
                    exif: {
                        description: "Exif data",
                        type: "object",
                        additionalProperties: {
                            "[key: string]": {
                                type: "object",
                                oneOf: [
                                    { type: "string" },
                                    { type: "number" },
                                    { type: "boolean" },
                                ],
                                // $ref: "#/components/schemas/string | number | boolean",
                            },
                        },
                    },
                    /*_status: {
                        description: "File status",
                        type: "object",
                        properties: {
                            status: {
                                type: "object",
                                $ref: "#/components/schemas/string, exif?: string, preview?: string",
                            },
                        },
                    },*/
                    _id: { description: "Entity identity", type: "string" },
                    _coretype: { description: "Core type", type: "string" },
                    _hash: { description: "Object hash", type: "string" },
                    preview: {
                        description: "Preview image",
                        type: "object",
                        $ref: "#/components/schemas/IPreview",
                    },
                },
                required: [
                    "name",
                    "file",
                    "type",
                    "size",
                    "_coretype",
                    "_hash",
                ],
            },
            IInitFile: {
                type: "object",
                description:
                    "Initial and update File interface (sends from client side)",
                properties: {
                    name: { description: "File name", type: "string" },
                    file: { description: "File path", type: "string" },
                    type: { description: "File type", type: "string" },
                    size: { description: "File size", type: "number" },
                    transcoder: {
                        description: "Transcoder id to use",
                        type: "string",
                    },
                    _transcode: {
                        description: "Transcode process id",
                        type: "string",
                    },
                    exif: {
                        description: "Exif data",
                        type: "object",
                        additionalProperties: {
                            "[key: string]": {
                                type: "object",
                                oneOf: [
                                    { type: "string" },
                                    { type: "number" },
                                    { type: "boolean" },
                                ]
                                // $ref: "#/components/schemas/string | number | boolean",
                            },
                        },
                    },
                    /*_status: {
                        description: "File status",
                        type: "object",
                        properties: {
                            status: {
                                type: "object",
                                $ref: "#/components/schemas/string, exif?: string, preview?: string",
                            },
                        },
                    },*/
                    _id: { description: "Entity identity", type: "string" },
                    preview: {
                        description: "Preview image",
                        type: "object",
                        $ref: "#/components/schemas/IPreview",
                    },
                },
                required: ["name", "file", "type", "size"],
            },
            IErrorMessage: {
                type: "object",
                description: "Error message",
                properties: {
                    message: { description: "Error message", type: "string" },
                    backtrace: {
                        description: "Error backtrace",
                        type: "array",
                        items: { type: "string" },
                    },
                },
                required: ["message", "backtrace"],
            },
            IError: {
                type: "object",
                description: "Error",
                properties: {
                    _error: {
                        description: "Error message",
                        type: "object",
                        $ref: "#/components/schemas/IErrorMessage",
                    },
                },
                required: ["_error"],
            },
            IBaseDocument: {
                type: "object",
                description: "Base Document interface",
                properties: {
                    title: { description: "Document title", type: "string" },
                    metadata: {
                        description: "Document metadata",
                        type: "object",
                        properties: {
                            size: { type: "number" },
                            type: { type: "string" },
                            lastModified: { type: "number" },
                        },
                    },
                },
                required: ["title"],
            },
            IDocument: {
                type: "object",
                description:
                    "Output document interface (sends from client side)",
                properties: {
                    title: { description: "Document title", type: "string" },
                    metadata: {
                        description: "Document metadata",
                        type: "object",
                        properties: {
                            size: { type: "number" },
                            type: { type: "string" },
                            lastModified: { type: "number" },
                        },
                    },
                    _id: { description: "Entity identity", type: "string" },
                    _coretype: { description: "Core type", type: "string" },
                    _hash: { description: "Object hash", type: "string" },
                    preview: {
                        description: "Preview image",
                        type: "object",
                        $ref: "#/components/schemas/IPreview",
                    },
                    file: {
                        description: "Document file",
                        type: "object",
                        $ref: "#/components/schemas/IFile",
                    },
                },
                required: ["title"],
            },
            IInitDocument: {
                type: "object",
                description:
                    "Initial and update document interface (sends from client side)",
                properties: {
                    title: { description: "Document title", type: "string" },
                    metadata: {
                        description: "Document metadata",
                        type: "object",
                        properties: {
                            size: { type: "number" },
                            type: { type: "string" },
                            lastModified: { type: "number" },
                        },
                    },
                    _id: { description: "Entity identity", type: "string" },
                },
                required: ["title"],
            },
            IDbObjectPermission: {
                type: "object",
                description: "'Entity permission'",
                properties: {
                    type: { description: "Permission type", type: "string" },
                    allow: { description: "Permission allow", type: "boolean" },
                },
                required: ["type"],
            },
            IDbObject: {
                type: "object",
                description: "Common object interface for all entities",
                properties: {
                    _id: { description: "Entity identity", type: "string" },
                    type: { description: "Object type", type: "string" },
                    status: {
                        description: "Object status",
                        type: "enum",
                        enum: ["normal", "deleted"],
                    },
                    _created: {
                        description: "Object creation action",
                        type: "object",
                        $ref: "#/components/schemas/IEntityAction",
                    },
                    _updated: {
                        description: "Object update action",
                        type: "object",
                        $ref: "#/components/schemas/IEntityAction",
                    },
                    _deleted: {
                        description: "Object delete action",
                        type: "object",
                        $ref: "#/components/schemas/IEntityAction",
                    },
                    _owner: { description: "Object owner", type: "string" },
                    _owners: {
                        description: "Object owners",
                        type: "array",
                        items: { type: "string" },
                    },
                    _owners_permissions: {
                        description: "Object owners permissions",
                        type: "object",
                        additionalProperties: {
                            "[key: string]": {
                                type: "array",
                                items: {
                                    type: "object",
                                    $ref: "#/components/schemas/IDbObjectPermission",
                                },
                            },
                        },
                    },
                    _tags: {
                        description: "Object tag ids",
                        type: "array",
                        items: { type: "string" },
                    },
                },
                required: ["type", "status", "_created"],
            },
            IOwned: {
                type: "object",
                description: "Owned element",
                properties: {
                    __owner: {
                        description: "Owner object definition",
                        type: "object",
                        $ref: "#/components/schemas/IDbObject",
                    },
                },
                required: ["__owner"],
            },
            ITagged: {
                type: "object",
                description: "tagged entities interface",
                properties: {
                    _tags: {
                        description: "tags assigned to the entitiy",
                        type: "array",
                        items: { type: "string" },
                    },
                },
            },
            IEntityAction: {
                type: "object",
                description: "Entity historical action",
                properties: {
                    _dt: {
                        description: "Action date",
                        type: "string",
                        format: "date-time",
                    },
                    _user: { description: "Action user", type: "string" },
                },
                required: ["_dt", "_user"],
            },
            IDbObjectBase: {
                type: "object",
                description: "DbObject base interface",
                properties: {
                    _id: { description: "Entity identity", type: "string" },
                    _coretype: { description: "Core type", type: "string" },
                    _hash: { description: "Object hash", type: "string" },
                },
                required: ["_coretype", "_hash"],
            },
            IPreview: {
                type: "object",
                description: "Preview interface for dbObjects",
                properties: {
                    _id: { description: "Entity identity", type: "string" },
                    preview: {
                        description: "Preview image, base64 encoded",
                        type: "string",
                    },
                    type: { description: "Preview image type", type: "string" },
                    hash: { description: "Image hash (md5)", type: "string" },
                    width: { description: "Image width (px)", type: "number" },
                    height: {
                        description: "Image height (px)",
                        type: "number",
                    },
                },
                required: ["type", "hash", "width", "height"],
            },
            IPreviewed: {
                type: "object",
                description: "Previewed interface for dbObjects",
                properties: {
                    preview: {
                        description: "Preview image",
                        type: "object",
                        $ref: "#/components/schemas/IPreview",
                    },
                },
                required: ["preview"],
            },
            ISession: {
                type: "object",
                description: "Session interface",
                properties: {
                    _id: { description: "Entity identity", type: "string" },
                    user: { description: "Session user id", type: "string" },
                    expired: {
                        description: "expiration flag",
                        type: "boolean",
                    },
                },
                required: ["user"],
            },
            IBaseCharacter: {
                type: "object",
                description: "Base character interface",
                properties: {
                    name: { description: "Character name", type: "string" },
                    role: { description: "Character role", type: "string" },
                    description: {
                        description: "Character description",
                        type: "string",
                    },
                },
                required: ["name", "role", "description"],
            },
            ICharacter: {
                type: "object",
                description: "Main Character interface",
                properties: {
                    name: { description: "Character name", type: "string" },
                    role: { description: "Character role", type: "string" },
                    description: {
                        description: "Character description",
                        type: "string",
                    },
                    _id: { description: "Entity identity", type: "string" },
                    _coretype: { description: "Core type", type: "string" },
                    _hash: { description: "Object hash", type: "string" },
                    preview: {
                        description: "Preview image",
                        type: "object",
                        $ref: "#/components/schemas/IPreview",
                    },
                },
                required: ["name", "role", "description"],
            },
            IInitCharacter: {
                type: "object",
                description:
                    "Initial and update character interface (sends from client side)",
                properties: {
                    name: { description: "Character name", type: "string" },
                    role: { description: "Character role", type: "string" },
                    description: {
                        description: "Character description",
                        type: "string",
                    },
                    _id: { description: "Entity identity", type: "string" },
                },
                required: ["name", "role", "description"],
            },
            ICategory: {
                type: "object",
                description: "Category",
                properties: {
                    _id: { description: "Entity identity", type: "string" },
                    _coretype: { description: "Core type", type: "string" },
                    _hash: { description: "Object hash", type: "string" },
                    name: { description: "Category name", type: "string" },
                    description: {
                        description: "Category description",
                        type: "string",
                    },
                },
                required: ["_coretype", "_hash", "name", "description"],
            },
            IBaseArtifact: {
                type: "object",
                description: "Artifact entity base schema",
                properties: {
                    name: { description: "Artifact name", type: "string" },
                    type: {
                        description: "Artifact type",
                        type: "enum",
                        enum: ["item", "weapon", "armor", "spell", "skill"],
                    },
                    subtype: {
                        description: "Artifact subtype",
                        type: "enum",
                        enum: ["steelArms", "fireArms"],
                    },
                },
                required: ["name", "type"],
            },
        },
    },
    paths: {},
    tags: [],
};
