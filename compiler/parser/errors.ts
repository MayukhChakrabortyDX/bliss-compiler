import type { Token } from "../lexer/tokens";
import type { Parser } from "./parser";

export class ParserDiagnostic {

    constructor(
        public title: string,
        public parser: Parser,
        public token: Token
    ) {}

    //now we produce the printable
    print() {
        this.parser.logTokenError(this.token, this.title)
    }

}