import { OATag } from '~/openapi/components';
import { ITsTagged } from '../../../model';
import { TsDecorator } from '../../../ts-decorator';
import { TsBaseTypeDefinition } from '../ts-base-type-definition';
import { ITsParser } from '../../../ts-readers/model';
import { ITsProperty } from '../../ts-property';
import { TsType } from '../..';
import { IOpenApiGather } from '~/openapi/components/model';
import { mergeDeep } from '~/openapi/utils';
import { TsInterfaceParser } from './ts-interface-parser';

/**
 * Interface definition
 * reading the interface definition and implementation for further extracting full component declaration to OpenApi specification
 */
export class TsInterfaceDefinition extends TsBaseTypeDefinition implements ITsTagged {
    private extendsTypes: TsType[];
    public isGeneric: boolean;
    public genericTypes: TsType[];
    public tag?: OATag;

    /**
     * TsInterfaceDefinition constructor
     * @param reader - reader to read interface definition
     * @param isExport - is interface exported
     * @param decorators - interface decorators
     */
    constructor(
        reader: ITsParser,
        isExport: boolean,
        decorators?: TsDecorator[],
    ) {
        const interfaceParser = new TsInterfaceParser(reader);
        super(interfaceParser, isExport, decorators);
    }

    public get typeName(): string {
        return 'object';
    }

    // mapping extended interfaces to OpenApi
    private mapExtenedPropertyToType(propertyType: TsType, gatherer?: IOpenApiGather): TsBaseTypeDefinition | undefined {
        const type = propertyType;
        if (
            type.isGeneric &&
            ['Partial', 'Promise'].includes(type.entityType)
        ) {
            const generic = gatherer.findType(type.genericArguments[0].referencedTypeName);
            return generic;
        }

        return undefined;
    }

    // reading interface definition, call inside TsBaseTypeDefinition
    protected read(reader: TsInterfaceParser) {
        const typeDefinition = reader.readInterfaceDefinition(); // expectOf('{', true);
        this._type = new TsType(reader);
    }

    /**
     * All properties for the interface, including properties from extended interfaces
     * @returns - properties list
     */
    public get properties(): ITsProperty[] {
        const properties = [...super.properties];

        if (this.extendsTypes) {
            this.extendsTypes.forEach(extendType => {
                const type = this.mapExtenedPropertyToType(extendType);
                if (type) {
                    properties.push(...((type as any).properties as ITsProperty[]));
                }
            });
        }
        return properties;
    }

    /**
     * Overrided properties to OpenApi from TsBaseTypeDefinition
     * @param gatherer
     * @returns
     */
    public override propertiesToOpenApi(gatherer: IOpenApiGather): { [key: string]: {}; } {
        let myProperties = { };
        if (this.extendsTypes.length) {
            this.extendsTypes.forEach(extendsType => {
                const etype = this.mapExtenedPropertyToType(extendsType, gatherer);
                if (etype) {
                    myProperties = mergeDeep(myProperties, etype.propertiesToOpenApi(gatherer));
                }
            });
        }
        myProperties = mergeDeep(myProperties, super.propertiesToOpenApi(gatherer));
        return myProperties;
    }

    /**
     * Interface definition to OpenApi
     * @param gatherer - gatherer to find type definition
     * @returns - OpenApi definition
     */
    public override toOpenApi(gatherer: IOpenApiGather): { [key: string]: string | number | object; } {
        const res: any = {};

        this.extendsTypes.forEach(extendsType => {
            const etype = this.mapExtenedPropertyToType(extendsType, gatherer);
            if (etype) {
                Object.assign(res, mergeDeep(res, etype.propertiesToOpenApi(gatherer)));
            }
        });

        Object.assign(res, mergeDeep(res, this._type.toOpenApi(gatherer)));
        return {
            [this.name]: res,
        };
    }
}