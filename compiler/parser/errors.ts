import type { Token } from "../lexer/tokens";
import type { ParserBase } from "./base";

export class ParserDiagnostic {

    constructor(
        public title: string,
        public parser: ParserBase,
        public token: Token
    ) {}

    //now we produce the printable
    print() {
        this.parser.logTokenError(this.token, this.title)
    }

}