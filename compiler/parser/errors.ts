import type { Token } from "../lexer/tokens";
import type { ParserLogger } from "./logger";

export class ParserDiagnostic {

    constructor(
        public title: string,
        public token: Token
    ) {}

    //now we produce the printable
    print(instance: ParserLogger) {
        instance.logTokenError(this.token, this.title)
    }

}