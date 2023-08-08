import { isBalanced } from '../utils';
import { TsEntity, ITsReader, ETsEntityTypes } from './ts-readers/model';
import { TsParser } from './ts-readers/ts-parser';

export class TsParameter extends TsEntity {
    constructor(name: string) {
        super(name, ETsEntityTypes.Argument);
    }

    public static readParameters(params: string, oreader: ITsReader): TsParameter[] {
        params = oreader.restoreCode(params);
        const result = [];
        if (!params) return [];
        const reader = new TsParser(params);
        let param = '';
        while(true) {
            const nparam = reader.expectOf(',', true);
            if (nparam !== undefined) {
                param += nparam;
                reader.move(1);
                if (this.checkIsConsistEnd(param.trim())) {
                    const paramValue = reader.restoreCode(param.trim());
                    result.push(new TsParameter(paramValue));
                    param = '';
                }
            } else {
                param += reader.readToEnd();
                if (this.checkIsConsistEnd(param.trim())) {
                    result.push(new TsParameter(reader.restoreCode(param.trim())));
                }
                break;
            }
        }
        return result;
    }

    private static checkIsConsistEnd(param: string): boolean {
        if (param.includes('{')) return isBalanced(param, ['{', '}']);
        if (param.startsWith('"') && !param.endsWith('"')) return false;
        if (param.startsWith("'") && !param.endsWith("'")) return false;
        if (param.startsWith('`') && !param.endsWith('`')) return false;
        return true;
    }
}