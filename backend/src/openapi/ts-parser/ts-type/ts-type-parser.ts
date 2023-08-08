import { TsParserBase } from '../ts-readers/ts-parser-base';

export class TsTypeParser extends TsParserBase {
    public readTypeDeclaration(): string {

        const nearestSign = this.getNearestSign();
        if (nearestSign === '{') {
            let index = this.current.indexOf(nearestSign);
            this.index += index;
            let endDef = this.readToBalanced('}');
            const nextSign = this.getNearestSign();
            if (nextSign === '[') {
                index = this.current.indexOf(nextSign);
                this.index += index;
                endDef += this.readToBalanced(']');
            }
            return endDef;
        }

        const epos = this.current.indexOf(';');
        const assignpos = this.current.indexOf('=');
        const endlinepos = this.current.indexOf('\n');
        const signs = [epos, assignpos, endlinepos].filter(x => x !== -1);
        if (signs.length === 0) return 'object';
        const rpos = Math.min(...signs);
        const type = this.current.substring(0, rpos);
        this.index += type.length + 1;
        return type;
    }

    public getNearestSign() {
        const ipos = this.current.match(/\S/)?.index;
        return ipos > -1 ? this.current[ipos] : null;
    }
}