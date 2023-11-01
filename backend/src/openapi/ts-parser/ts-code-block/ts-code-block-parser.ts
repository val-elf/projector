import { TsParserBase } from "../ts-readers";
import { TsCodeBlock } from "./ts-code-block";

class TsCodeBlockImpl extends TsCodeBlock {}

export class TsCodeBlockParser extends TsParserBase {
    public static readCodeBlock(parser: TsParserBase): TsCodeBlock {
        try {
            const codeBlock = new TsCodeBlockParser(parser);
            return codeBlock.readCodeBlock();
        } finally {
            console.groupEnd();
        }
    }

    private readCodeBlock(): TsCodeBlock {
        const code = this.readToBalanced('}', true);
        this.index++;
        return new TsCodeBlockImpl(code);
    }
}