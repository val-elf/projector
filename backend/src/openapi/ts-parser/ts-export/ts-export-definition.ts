import { TsEntity } from "../model";
import { ETsEntityTypes } from "../ts-readers/model";

export class TsExportItem {
    public name: string;
    public alias?: string;
}

type TExportItems = (TsExportItem | TsExportItem[])[];

export abstract class TsExportDefinition extends TsEntity {

    public readonly entityType = ETsEntityTypes.Export;

    public exportItems: TExportItems = [];
    public exportPath: string;

    constructor() {
        super('');
    }
}