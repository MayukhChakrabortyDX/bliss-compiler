import type { Token } from "../lexer/tokens";
import type { ParserBase } from "./base";
import type { Parser } from "./parser";

export class ParserDiagnostic {

    constructor(
        public title: string,
        public parser: Parser | ParserBase,
        public token: Token
    ) {}

    //now we produce the printable
    print() {
        this.parser.logTokenError(this.token, this.title)
    }

}