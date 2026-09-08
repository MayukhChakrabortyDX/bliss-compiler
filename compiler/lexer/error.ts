import { charLogFilter } from "../logger/filters/charLog.filter";
import { Log, LogType } from "../logger/logger";
import { TokenizeBase } from "./helper";

// error handling (much more efficient and verbose) for tokenization phase
export class ErrorHandling extends TokenizeBase {
    logCharError(char: string, message: string): void {
        const forSource = charLogFilter(this.source);

        Log({
            type: LogType.Error,
            stage: "tokenizer",
            message,
            filter: forSource(char, this.presentState, this.span_end),
        });

        process.exit(1);
    }
}