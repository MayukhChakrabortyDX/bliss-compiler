import { log, LogType } from "../logger/logger";
import { TokenizeBase } from "./helper";

// error handling for tokenization phase
export class ErrorHandling extends TokenizeBase {
    logCharError(char: string, message: string): void {
        const source = this.sourceContainer.str;
        const position = this.span_end;

        const row = source.slice(0, position).split("\n").length;
        const lastNewline = source.lastIndexOf("\n", position - 1);
        const col = position - lastNewline;

        log({
            type: LogType.Error,
            where: "TOKENIZER",
            title: message,
            description:
                `Unexpected character ${JSON.stringify(char)} ` +
                `at row ${row}, col ${col}.`,
        });

        process.exit(1);
    }
}