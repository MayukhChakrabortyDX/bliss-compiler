import { log, LogType } from "../logger/logger";

export class ParserDiagnostic {

    constructor(
        public type: LogType,
        public title: string,
        public suggestion: string
    ) {}

    //now we produce the printable
    print() {

        log({
            type: this.type,
            where: "PARSER",
            title: this.title,
            description: `At line x, col y happend.`,
            suggestion: this.suggestion
        })

    }

}