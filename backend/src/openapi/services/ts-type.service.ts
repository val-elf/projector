import assert from "assert";
import { TsFile } from "../reader";
import { TsBaseTypeDefinition } from "../ts-parser/ts-types/ts-type-definitions/ts-base-type-definition";
import { ITsMethod, ITsProperty, ITsType, TsType } from "../ts-parser/ts-types";
import { TsGenericsList } from "../ts-parser/ts-types/ts-generics-list/ts-generics-list";
import { TsProperty } from "../ts-parser/ts-types/ts-property";
import { TsMethod } from "../ts-parser/ts-types/ts-method";
import { TsTypeOwner } from "../ts-parser/model";
import { TsDateServiceType } from "../ts-parser/ts-types/ts-type/service-types/ts-date-service-type";
import { OpenApiInstance } from "../components";

type TFileTypeRegister = TsBaseTypeDefinition[];

class TsTypeImpl extends TsType {
    unionTypes?: ITsType[];

    public readonly isGeneric = false;
    public readonly isUnion = false;

    constructor(referencedTypeName?: string, protected parent?: ITsType) {
        super();
        this._referencedTypeName = referencedTypeName;
    }

    public populateProperties(properties: ITsProperty[]) {
        this._properties = properties;
    }

    public populateMethods(methods: ITsMethod[]) {
        this._methods = methods;
    }

    public populateReferenceName(name: string) {
        this._referencedTypeName = name;
    }

    public populateGenericsList(genericBase: ITsType, genericsList: TsGenericsList) {
        this._genericBase = genericBase;
        this._genericList = genericsList;
    }

    protected clone(): ITsType {
        const res = new TsTypeImpl(this.referencedTypeName);
        res._genericList = this._genericList;
        res._isAlias = this._isAlias;
        res._methods = this._methods;
        res._properties = this._properties;
        res._intersectionTypes = this._intersectionTypes;
        return res;
    }

    public addUnionItem(member: ITsType) {
        throw new Error('Method not implemented.');
    }
    public getLatestUnion(): ITsType {
        throw new Error('Method not implemented.');
    }

    public get properties(): ITsProperty[] {
        if (this.referencedTypeName) {
            const originType = TsTypeService.getService().findTsType(this.referencedTypeName);
            if (originType) {
                return originType.properties;
            }
        }
        return super.properties;
    }
}

class TsTypePrimitive extends TsTypeImpl {
    public addUnionItem(member: ITsType) {
        throw new Error('Method not implemented.');
    }
    unionTypes?: ITsType[];
    getLatestUnion(): ITsType {
        throw new Error('Method not implemented.');
    }
    protected readonly _referencedTypeName: string;
    constructor(referencedTypeName: string) {
        super(undefined);
        this._referencedTypeName = referencedTypeName;
    }

    public populateMethods(methods: ITsMethod[]): void {
        throw new Error('Method not implemented.');
    }

    public populateProperties(properties: ITsProperty[]): void {
        throw new Error('Method not implemented.');
    }

    protected clone(): ITsType {
        return undefined;
    }

    public toOpenApi() {
        return {
            type: this.referencedTypeName,
        }
    }
}

class TsTypeDate extends TsTypeImpl {
    protected readonly _referencedTypeName: string = 'Date';
    constructor() {
        super('Date');
    }

    public toOpenApi() {
        return {
            type: 'string',
        }
    }
}



export abstract class TsTypeService {
    private typeRegister: Map<string, TFileTypeRegister> = new Map<string, TFileTypeRegister>();
    private actualFile: TsFile | undefined;

    private static serviceInstance: TsTypeService;

    public static getService(): TsTypeService {
        if (!this.serviceInstance) {
            this.serviceInstance = new TsTypeServiceImpl();
        }
        return this.serviceInstance;
    }

    public registerFile(tsFile: TsFile) {
        this.actualFile = tsFile;
        const fileRegister = [];
        this.typeRegister.set(tsFile.fileName, fileRegister);
    }

    public registerType(type: TsBaseTypeDefinition) {
        assert(this.actualFile);
        const fileRegister = this.typeRegister.get(this.actualFile.fileName);
        assert(fileRegister);
        fileRegister.push(type);
    }

    public findTsType(referencedName: string): TsBaseTypeDefinition | undefined {
        for (const [fileName, fileRegister] of this.typeRegister) {
            const type = fileRegister.find(type => type.name === referencedName);
            if (type) {
                return type;
            }
        }
    }

    public static createInterfaceType(members: (ITsProperty | ITsMethod)[]): TsType {
        const result = new TsTypeImpl();
        result.populateProperties(members.filter(m => (m instanceof TsProperty)) as ITsProperty[]);
        result.populateMethods(members.filter(m => m instanceof TsMethod) as TsMethod[]);
        return result;
    }

    public static createEmptyType() {
        return new TsTypeImpl('', undefined);
    }

    public static createReferencedType(typeName: string): ITsType {
        const type = new TsTypeImpl(typeName);
        return type;
    }

    public static createPrimitiveType(typeName: string): ITsType {
        const type = new TsTypePrimitive(typeName);
        return type;
    }

    public static isBuiltinType(type: ITsType): boolean {
        return this.PRIMITIVES.includes(type) || this.GENERICS.includes(type) || type === this.Date;
    }

    public static readonly String = this.createPrimitiveType('string');
    public static readonly Number = this.createPrimitiveType('number');
    public static readonly Any = this.createPrimitiveType('any');
    public static readonly Boolean = this.createPrimitiveType('boolean');
    public static readonly Never = this.createPrimitiveType('never');
    public static readonly Void = this.createPrimitiveType('void');
    public static readonly Undefined = this.createPrimitiveType('undefined');
    public static readonly Null = this.createPrimitiveType('null');
    public static readonly Unknown = this.createPrimitiveType('unknown');

    public static readonly Date = new TsDateServiceType();
    public static readonly PromiseType = this.createReferencedType('Promise');
    public static readonly ArrayType = this.createReferencedType('Array');
    public static readonly PartialType = this.createReferencedType('Partial');
    public static readonly OmitType = this.createReferencedType('Omit');
    public static readonly ExcludeType = this.createReferencedType('Exclude');
    public static readonly AwaitedType = this.createReferencedType('Awaited');
    public static readonly RequiredType = this.createReferencedType('Required');
    public static readonly ReadonlyType = this.createReferencedType('Readonly');
    public static readonly RecordType = this.createReferencedType('Record');
    public static readonly PickType = this.createReferencedType('Pick');
    public static readonly ExtractType = this.createReferencedType('Extract');
    public static readonly NonNullableType = this.createReferencedType('NonNullable');
    public static readonly ParametersType = this.createReferencedType('Parameters');

    public static findBuiltinByName(name: string): ITsType | undefined {
        if (name === 'Date') return this.Date;
        return this.PRIMITIVES.find(type => type.referencedTypeName === name) ||
            this.GENERICS.find(type => type.referencedTypeName === name);
    }

    public static PRIMITIVES = [
        this.String,
        this.Number,
        this.Boolean,
        this.Any,
        this.Void,
        this.Null,
        this.Undefined,
        this.Never,
        this.Unknown
    ];

    public static GENERICS = [
        this.PromiseType,
        this.ArrayType,
        this.PartialType,
        this.RequiredType,
        this.PickType,
        this.RecordType,
        this.ReadonlyType,
        this.OmitType,
        this.ExcludeType,
        this.AwaitedType,
        this.ExtractType,
        this.NonNullableType,
        this.ParametersType
    ];

    public static UTILITIES = [
        this.PartialType,
        this.OmitType,
        this.ExcludeType,
        this.AwaitedType,
        this.RequiredType,
        this.ReadonlyType,
        this.RecordType,
        this.PickType,
        this.ExtractType,
        this.NonNullableType,
        this.ParametersType
    ];

}

class TsTypeServiceImpl extends TsTypeService {

}

export const UtitlityTypes = TsTypeService.UTILITIES;
export const PrimitiveTypes = TsTypeService.PRIMITIVES;
export const GenericTypes = TsTypeService.GENERICS;
